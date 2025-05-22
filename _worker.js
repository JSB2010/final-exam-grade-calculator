export default {
  async fetch(request, env) {
    // Forward the request to the static assets handler
    return env.ASSETS.fetch(request);
  }
};
