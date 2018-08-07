module.exports = (RED) => {
  const mustache = require("mustache");
  const fetch = require("node-fetch");
  class GraphQLServer {
    constructor(config) {
      RED.nodes.createNode(this, config);
      this.endpoint = config.endpoint;
    }
  }
  class GraphQLNode {
    constructor(config) {
      RED.nodes.createNode(this, config);
      this.on("input", (msg) => this.handleInput(msg));
      this.on("close", () => this.handleClose());
      this.config = config;
    }
    async handleInput(msg) {
      const serverNode = RED.nodes.getNode(this.config.server);
      const {credentials, endpoint} = serverNode;
      const {
        template = this.config.template,
        syntax = this.config.syntax,
      } = msg;
      const variables = msg.payload.variables || msg.variables;
      let query;
      switch (syntax) {
        case "mustache":
          query = mustache.render(template, msg);
          break;
        default:
          query = template;
          break;
      }

      const headers = {};
      if (credentials) {
        if (credentials.token) {
          headers.Authorization = `Bearer ${credentials.token}`;
        }
      }
      this.status({
        fill: "yellow",
        shape: "dot",
        text: RED._("graphql.status.connecting")
      });
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: Object.assign({}, headers || {}, {
            "Accept": "application/json",
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            query,
            variables,
          }),
        });
        const data = await response.json();

        switch (response.status) {
          case 200:
            this.status({
              fill: "green",
              shape: "dot",
              text: RED._("graphql.status.connected")
            });
            let rmsg = Object.assign({}, msg, {
              payload: data.data,
            });
            this.send(rmsg);
            break;
          default:

            RED.log.debug(response);
            this.status({
              fill: "red",
              shape: "dot",
              text: RED._("graphql.errors.failed")
            });
            let errmsg = Object.assign({}, msg, {payload: {
              statusCode: response.status,
              message: RED._("graphql.errors.failed"),
            }});
            this.error(errmsg);
            break;
        }
      } catch (ex) {
        RED.log.debug(ex);
        this.status({
          fill: "red",
          shape: "dot",
          text: ex,
        });
        this.error(ex);
      }
    }
    handleClose() {
      RED.log.debug("closing Node");
    }
  }
  RED.nodes.registerType("graphql", GraphQLNode);
  RED.nodes.registerType("graphql-server", GraphQLServer, {
    credentials: {
      token: {type: "text"},
    },
  });
};
