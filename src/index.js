import { handleRequest } from './handler'

export default {
  async fetch(request, env, context) {
    return handleRequest(request, context)
  }
}
