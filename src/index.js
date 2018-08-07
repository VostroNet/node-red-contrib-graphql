module.exports = (RED) => {
  const mustache = require("mustache");
  const fetch = require("fetch");
  class GraphQLServer {
    constructor(config) {
      RED.nodes.createNode(this, config);
      this.endpoint = config.endpoint;
       
    }
  }
  class GraphQLNode {
    constructor(config) {
      RED.nodes.createNode(this, config);
      node.on("input", (msg) => this.handleInput(msg));
      node.on("close", () => this.handleClose());
      this.config = config;
      this.serverConfig = RED.nodes.getNode(config.serverConfig);
    }
    async handleInput(msg) {
      RED.log.debug("msg", msg);
      const credentials = RED.nodes.getCredentials(this.serverConfig);
      const {
        template = this.config.template,
        syntax = this.config.syntax,
        variables,
      } = msg;
      let query;
      switch(syntax) {
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
        const response = await fetch(this.serverConfig.endpoint, {
          method: "POST",
          headers: Object.assign({}, headers || {}, {
            "Accept": "application/json",
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            query,
            variables
          })
        });
        const data = await response.json();

        switch(response.status) {
          case 200:
            this.status({
              fill: "green",
              shape: "dot",
              text: RED._("graphql.status.connected")
            });
            let rmsg = Object.assign({}, msg, {
              payload: data.data
            });
            this.send(rmsg);

          break;
          default:
            this.status({
              fill: "red",
              shape: "dot",
              text: RED._("graphql.errors.failed")
            });
            let rmsg = Object.assign({}, msg, {payload: {
              statusCode: response.status,
              message: RED._("graphql.errors.failed"),
            }});
            this.error(RED._("graphql.errors.failed"), rmsg);
            break; 
        }

        

      } catch(ex) {
        node.status({
          fill: "red",
          shape: "dot",
          text: RED._("graphql.status.failed")
        });
        this.error(RED._("graphql.errors.failed"), ex);
      }



    }
    handleClose() {
      RED.log.debug("closing Node");

    }
  }
  RED.nodes.registerType("graphql", GraphQLNode);
  RED.nodes.registerType("graphql-server", GraphQLServer, {
    credentials: {
      bearerToken: { type: "password" }
    }
  });
}
