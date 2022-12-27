import fetch from 'node-fetch';

class IntegrationsLoader {
  private cache ;

  environment;

  get integrations() {
    return (async () => {
      if (!this.cache) {
        this.cache = fetch(`${this.environment.backend.builderShop}/api/context/cache/v2`)
          .then(response => response.json())
          .then(data => data.integrations);
      }

      return this.cache;
    })();
  }
}

export const loader = new IntegrationsLoader();
