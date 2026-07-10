# Simulation Diagnostics Log
This file tracks API failures and model fallback events to identify performance bottlenecks.

| Timestamp | Agent ID | Model | Status | Error Detail |
|-----------|----------|-------|--------|--------------|
| 2026-04-02T12:23:30.237Z | 41 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:23:30.992Z | 41 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:23:31.710Z | 41 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:23:32.781Z | 41 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:23:33.236Z | 43 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:23:33.335Z | 42 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:23:33.435Z | 42 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:23:33.530Z | 41 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:23:33.536Z | 42 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:23:33.672Z | 42 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:23:36.101Z | 44 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:23:36.237Z | 44 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:23:36.718Z | 44 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:23:36.856Z | 44 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:23:36.994Z | 44 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:23:40.656Z | 45 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:23:40.862Z | 46 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:23:40.964Z | 46 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:23:41.066Z | 46 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:23:41.154Z | 46 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:23:41.251Z | 46 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:23:41.611Z | 46 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Rate limit excee |
| 2026-04-02T12:23:41.964Z | 45 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:23:42.319Z | 46 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T12:23:42.342Z | 45 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Rate limit excee |
| 2026-04-02T12:23:42.449Z | 45 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:23:42.539Z | 45 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:23:42.627Z | 45 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:23:49.569Z | 65 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:23:52.383Z | 67 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:23:52.872Z | 68 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:23:52.885Z | 69 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:23:52.896Z | 67 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Rate limit excee |
| 2026-04-02T12:23:52.981Z | 67 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:23:53.189Z | 70 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:23:53.252Z | 69 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:23:53.281Z | 70 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:23:53.307Z | 68 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Rate limit excee |
| 2026-04-02T12:23:53.377Z | 69 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:23:53.457Z | 69 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:23:53.474Z | 67 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:23:53.551Z | 69 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:23:53.650Z | 70 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:23:53.739Z | 70 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:23:53.928Z | 69 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Rate limit excee |
| 2026-04-02T12:23:53.969Z | 68 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T12:23:54.502Z | 68 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:23:54.730Z | 69 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T12:23:54.738Z | 68 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:23:55.032Z | 68 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:23:55.048Z | 71 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:23:55.471Z | 68 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:23:55.831Z | 71 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Rate limit excee |
| 2026-04-02T12:23:56.100Z | 71 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:23:56.200Z | 71 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:23:56.270Z | 48 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Rate limit excee |
| 2026-04-02T12:23:56.296Z | 71 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:23:56.364Z | 48 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:23:56.451Z | 48 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:23:59.746Z | 49 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:23:59.851Z | 49 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:24:03.860Z | 50 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:24:04.327Z | 50 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:04.742Z | 50 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:24:04.764Z | 51 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:24:04.845Z | 52 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:24:04.938Z | 52 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:24:05.307Z | 52 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:24:05.388Z | 50 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T12:24:05.443Z | 51 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:24:05.528Z | 51 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:24:05.756Z | 50 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:24:05.838Z | 50 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:24:06.036Z | 52 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:24:06.209Z | 50 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:24:06.249Z | 51 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T12:24:06.361Z | 51 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:06.451Z | 51 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:24:06.497Z | 52 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:06.554Z | 51 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:24:06.579Z | 52 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:24:06.587Z | 53 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:06.655Z | 54 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:24:06.759Z | 54 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:24:06.856Z | 54 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:24:06.943Z | 53 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:24:06.988Z | 54 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:07.034Z | 53 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:24:07.135Z | 53 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:24:07.437Z | 54 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:24:08.385Z | 53 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T12:24:08.471Z | 53 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:24:09.335Z | 53 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:24:09.456Z | 55 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:24:09.829Z | 55 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:24:10.155Z | 72 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:24:10.248Z | 72 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:24:10.534Z | 55 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:24:10.915Z | 72 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T12:24:11.047Z | 73 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:24:11.140Z | 73 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:24:11.238Z | 55 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:24:11.620Z | 72 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:24:11.721Z | 72 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:24:12.085Z | 72 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:12.087Z | 73 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:24:12.118Z | 74 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:24:12.157Z | 72 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:24:12.281Z | 75 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:24:12.660Z | 75 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Rate limit excee |
| 2026-04-02T12:24:12.748Z | 73 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:12.757Z | 75 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:24:12.815Z | 74 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:24:12.831Z | 73 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:24:12.898Z | 74 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:24:13.298Z | 74 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:24:13.783Z | 74 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:13.955Z | 75 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T12:24:14.326Z | 75 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:24:14.455Z | 74 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T12:24:14.705Z | 75 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:24:14.798Z | 75 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:14.805Z | 74 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:24:16.491Z | 76 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T12:24:16.859Z | 76 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:24:16.941Z | 76 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:24:17.036Z | 76 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:24:17.392Z | 76 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:24:17.611Z | 77 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T12:24:17.777Z | 76 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Rate limit excee |
| 2026-04-02T12:24:17.911Z | 76 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:17.955Z | 78 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:24:17.994Z | 77 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:24:18.028Z | 79 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:18.059Z | 78 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:24:18.173Z | 78 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:24:18.267Z | 78 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:24:18.360Z | 77 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:24:18.392Z | 79 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:24:18.473Z | 79 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:24:18.632Z | 78 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Rate limit excee |
| 2026-04-02T12:24:18.761Z | 77 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Rate limit excee |
| 2026-04-02T12:24:18.824Z | 79 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Rate limit excee |
| 2026-04-02T12:24:18.854Z | 77 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:24:18.931Z | 79 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:24:18.948Z | 77 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:18.980Z | 78 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:19.070Z | 77 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:24:27.782Z | 57 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:24:27.788Z | 58 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:24:27.800Z | 59 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:24:28.067Z | 56 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:28.151Z | 57 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Rate limit excee |
| 2026-04-02T12:24:28.187Z | 59 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Rate limit excee |
| 2026-04-02T12:24:28.251Z | 58 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:28.403Z | 60 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:24:28.725Z | 57 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:24:28.774Z | 56 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:24:28.779Z | 60 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:24:28.896Z | 56 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:24:29.035Z | 56 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:24:29.124Z | 57 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:24:29.135Z | 60 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Rate limit excee |
| 2026-04-02T12:24:29.254Z | 60 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:29.359Z | 60 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:24:29.616Z | 57 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:32.674Z | 61 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:24:33.065Z | 61 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:38.350Z | 62 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:38.862Z | 62 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Rate limit excee |
| 2026-04-02T12:24:38.969Z | 62 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:24:39.053Z | 62 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:24:40.215Z | 62 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T12:24:40.590Z | 62 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:24:40.671Z | 63 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:24:40.691Z | 62 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:24:40.766Z | 63 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:40.849Z | 63 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:24:41.200Z | 63 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Rate limit excee |
| 2026-04-02T12:24:41.844Z | 63 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T12:24:41.952Z | 63 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:24:42.059Z | 63 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:24:47.472Z | 64 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:47.774Z | 68 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:24:48.056Z | 69 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:24:48.445Z | 69 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Rate limit excee |
| 2026-04-02T12:24:48.499Z | 65 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:48.658Z | 67 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:48.846Z | 69 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:24:48.873Z | 65 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:24:49.044Z | 67 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Rate limit excee |
| 2026-04-02T12:24:49.133Z | 67 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:24:49.240Z | 65 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:24:49.373Z | 69 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:49.616Z | 65 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:24:49.688Z | 67 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:24:49.919Z | 65 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:24:50.270Z | 67 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:24:51.220Z | 67 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:24:53.170Z | 70 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:24:53.550Z | 70 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:24:53.963Z | 70 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:25:00.179Z | 71 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:25:01.085Z | 71 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:25:01.468Z | 71 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:25:01.835Z | 71 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:25:16.914Z | 73 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:25:17.087Z | 74 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:25:17.099Z | 77 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:25:17.220Z | 76 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:25:17.453Z | 72 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:25:17.530Z | 72 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:25:17.606Z | 76 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:25:17.637Z | 73 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:25:17.696Z | 76 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:25:17.743Z | 73 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:25:17.844Z | 77 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:25:17.914Z | 72 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:25:17.942Z | 77 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:25:18.321Z | 72 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:25:18.521Z | 76 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:25:18.574Z | 73 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:25:18.617Z | 76 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:25:19.963Z | 73 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T12:25:20.001Z | 76 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T12:25:20.061Z | 73 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:25:20.172Z | 73 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:25:20.295Z | 78 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:25:20.374Z | 76 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:25:20.440Z | 75 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T12:25:20.546Z | 75 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:25:21.225Z | 75 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:25:21.270Z | 79 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:25:21.565Z | 75 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:25:21.580Z | 79 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:25:21.651Z | 75 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:25:21.670Z | 79 | minimax/minimax-m2.5:free | 404 | Model minimax/minimax-m2.5:free failed (HTTP 404): {"error":{"message":"No endpoints available match |
| 2026-04-02T12:25:21.772Z | 79 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:25:22.385Z | 75 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:25:22.487Z | 75 | arcee-ai/trinity-mini:free | 429 | Model arcee-ai/trinity-mini:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-m |
| 2026-04-02T12:26:57.824Z | 0 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:27:05.276Z | 0 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:27:05.563Z | 0 | google/gemini-2.0-flash-exp:free | 404 | Model google/gemini-2.0-flash-exp:free failed (HTTP 404): {"error":{"message":"No endpoints found fo |
| 2026-04-02T12:27:05.644Z | 0 | meta-llama/llama-3.1-405b-instruct:free | 404 | Model meta-llama/llama-3.1-405b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints f |
| 2026-04-02T12:27:05.718Z | 0 | mistralai/mistral-small-24b-instruct-2501:free | 404 | Model mistralai/mistral-small-24b-instruct-2501:free failed (HTTP 404): {"error":{"message":"No endp |
| 2026-04-02T12:27:12.536Z | 0 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T12:28:05.012Z | 0 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:28:13.963Z | 1 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:28:14.690Z | 1 | google/gemini-2.0-flash-exp:free | 404 | Model google/gemini-2.0-flash-exp:free failed (HTTP 404): {"error":{"message":"No endpoints found fo |
| 2026-04-02T12:28:20.705Z | 1 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:28:57.828Z | 3 | mistralai/mistral-small-24b-instruct-2501:free | 404 | Model mistralai/mistral-small-24b-instruct-2501:free failed (HTTP 404): {"error":{"message":"No endp |
| 2026-04-02T12:28:57.926Z | 3 | google/gemini-2.0-flash-exp:free | 404 | Model google/gemini-2.0-flash-exp:free failed (HTTP 404): {"error":{"message":"No endpoints found fo |
| 2026-04-02T12:28:58.028Z | 3 | meta-llama/llama-3.1-405b-instruct:free | 404 | Model meta-llama/llama-3.1-405b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints f |
| 2026-04-02T12:29:03.449Z | 3 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:29:09.644Z | 3 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:29:16.352Z | 3 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T12:29:21.816Z | 3 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:29:25.661Z | 4 | meta-llama/llama-3.1-405b-instruct:free | 404 | Model meta-llama/llama-3.1-405b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints f |
| 2026-04-02T12:29:25.748Z | 4 | google/gemini-2.0-flash-exp:free | 404 | Model google/gemini-2.0-flash-exp:free failed (HTTP 404): {"error":{"message":"No endpoints found fo |
| 2026-04-02T12:29:31.413Z | 4 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:29:36.863Z | 4 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:29:42.696Z | 4 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:29:42.902Z | 4 | mistralai/mistral-small-24b-instruct-2501:free | 404 | Model mistralai/mistral-small-24b-instruct-2501:free failed (HTTP 404): {"error":{"message":"No endp |
| 2026-04-02T12:29:53.436Z | 5 | google/gemini-2.0-flash-exp:free | 404 | Model google/gemini-2.0-flash-exp:free failed (HTTP 404): {"error":{"message":"No endpoints found fo |
| 2026-04-02T12:29:58.744Z | 5 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:30:19.738Z | 6 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:30:36.381Z | 7 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T12:30:42.879Z | 7 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:30:43.131Z | 7 | google/gemini-2.0-flash-exp:free | 404 | Model google/gemini-2.0-flash-exp:free failed (HTTP 404): {"error":{"message":"No endpoints found fo |
| 2026-04-02T12:30:43.222Z | 7 | meta-llama/llama-3.1-405b-instruct:free | 404 | Model meta-llama/llama-3.1-405b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints f |
| 2026-04-02T12:30:43.310Z | 7 | mistralai/mistral-small-24b-instruct-2501:free | 404 | Model mistralai/mistral-small-24b-instruct-2501:free failed (HTTP 404): {"error":{"message":"No endp |
| 2026-04-02T12:30:49.172Z | 7 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:30:54.679Z | 7 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:31:04.683Z | 8 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:31:05.274Z | 8 | mistralai/mistral-small-24b-instruct-2501:free | 404 | Model mistralai/mistral-small-24b-instruct-2501:free failed (HTTP 404): {"error":{"message":"No endp |
| 2026-04-02T12:31:21.369Z | 9 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:31:21.926Z | 9 | google/gemini-2.0-flash-exp:free | 404 | Model google/gemini-2.0-flash-exp:free failed (HTTP 404): {"error":{"message":"No endpoints found fo |
| 2026-04-02T12:31:27.248Z | 9 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:31:27.835Z | 9 | mistralai/mistral-small-24b-instruct-2501:free | 404 | Model mistralai/mistral-small-24b-instruct-2501:free failed (HTTP 404): {"error":{"message":"No endp |
| 2026-04-02T12:31:27.912Z | 9 | meta-llama/llama-3.1-405b-instruct:free | 404 | Model meta-llama/llama-3.1-405b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints f |
| 2026-04-02T12:32:30.347Z | 12 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:32:31.153Z | 12 | mistralai/mistral-small-24b-instruct-2501:free | 404 | Model mistralai/mistral-small-24b-instruct-2501:free failed (HTTP 404): {"error":{"message":"No endp |
| 2026-04-02T12:32:51.771Z | 13 | meta-llama/llama-3.1-405b-instruct:free | 404 | Model meta-llama/llama-3.1-405b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints f |
| 2026-04-02T12:32:57.754Z | 13 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:32:58.047Z | 13 | google/gemini-2.0-flash-exp:free | 404 | Model google/gemini-2.0-flash-exp:free failed (HTTP 404): {"error":{"message":"No endpoints found fo |
| 2026-04-02T12:33:03.650Z | 13 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:33:04.891Z | 13 | mistralai/mistral-small-24b-instruct-2501:free | 404 | Model mistralai/mistral-small-24b-instruct-2501:free failed (HTTP 404): {"error":{"message":"No endp |
| 2026-04-02T12:33:10.563Z | 13 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:33:17.427Z | 13 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T12:33:22.062Z | 14 | google/gemini-2.0-flash-exp:free | 404 | Model google/gemini-2.0-flash-exp:free failed (HTTP 404): {"error":{"message":"No endpoints found fo |
| 2026-04-02T12:33:28.489Z | 14 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T12:33:28.846Z | 14 | meta-llama/llama-3.1-405b-instruct:free | 404 | Model meta-llama/llama-3.1-405b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints f |
| 2026-04-02T12:33:34.711Z | 14 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:33:40.775Z | 14 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:33:46.303Z | 14 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:33:46.553Z | 14 | mistralai/mistral-small-24b-instruct-2501:free | 404 | Model mistralai/mistral-small-24b-instruct-2501:free failed (HTTP 404): {"error":{"message":"No endp |
| 2026-04-02T12:34:01.751Z | 16 | meta-llama/llama-3.1-405b-instruct:free | 404 | Model meta-llama/llama-3.1-405b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints f |
| 2026-04-02T12:34:07.121Z | 16 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:34:07.372Z | 16 | mistralai/mistral-small-24b-instruct-2501:free | 404 | Model mistralai/mistral-small-24b-instruct-2501:free failed (HTTP 404): {"error":{"message":"No endp |
| 2026-04-02T12:34:28.775Z | 17 | meta-llama/llama-3.2-3b-instruct:free | 402 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 402): {"error":{"message":"Provider returne |
| 2026-04-02T12:34:29.082Z | 17 | google/gemini-2.0-flash-exp:free | 404 | Model google/gemini-2.0-flash-exp:free failed (HTTP 404): {"error":{"message":"No endpoints found fo |
| 2026-04-02T12:34:34.560Z | 17 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:34:34.803Z | 17 | mistralai/mistral-small-24b-instruct-2501:free | 404 | Model mistralai/mistral-small-24b-instruct-2501:free failed (HTTP 404): {"error":{"message":"No endp |
| 2026-04-02T12:34:34.898Z | 17 | meta-llama/llama-3.1-405b-instruct:free | 404 | Model meta-llama/llama-3.1-405b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints f |
| 2026-04-02T12:34:40.701Z | 17 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T12:34:47.085Z | 17 | nvidia/nemotron-3-nano-30b-a3b:free | 429 | Model nvidia/nemotron-3-nano-30b-a3b:free failed (HTTP 429): {"error":{"message":"Rate limit exceede |
| 2026-04-02T12:35:18.813Z | 19 | meta-llama/llama-3.2-3b-instruct:free | 429 | Model meta-llama/llama-3.2-3b-instruct:free failed (HTTP 429): {"error":{"message":"Provider returne |
| 2026-04-02T12:35:19.213Z | 19 | meta-llama/llama-3.1-405b-instruct:free | 404 | Model meta-llama/llama-3.1-405b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints f |
| 2026-04-02T12:35:24.878Z | 19 | z-ai/glm-4.5-air:free | 429 | Model z-ai/glm-4.5-air:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models |
| 2026-04-02T12:51:16.713Z | 0 | nvidia/nemotron-4-340b-instruct:free | 404 | Model nvidia/nemotron-4-340b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints foun |
| 2026-04-02T12:51:16.831Z | 0 | mistralai/mistral-7b-instruct:free | 404 | Model mistralai/mistral-7b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints found  |
| 2026-04-02T12:51:16.928Z | 0 | meta-llama/llama-3.1-8b-instruct:free | 404 | Model meta-llama/llama-3.1-8b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints fou |
| 2026-04-02T12:51:17.011Z | 0 | google/gemini-flash-1.5:free | 404 | Model google/gemini-flash-1.5:free failed (HTTP 404): {"error":{"message":"No endpoints found for go |
| 2026-04-02T12:51:42.985Z | 1 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-02T12:51:43.633Z | 1 | google/gemini-flash-1.5:free | 404 | Model google/gemini-flash-1.5:free failed (HTTP 404): {"error":{"message":"No endpoints found for go |
| 2026-04-02T12:51:43.713Z | 1 | meta-llama/llama-3.1-8b-instruct:free | 404 | Model meta-llama/llama-3.1-8b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints fou |
| 2026-04-02T12:51:43.778Z | 1 | nvidia/nemotron-4-340b-instruct:free | 404 | Model nvidia/nemotron-4-340b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints foun |
| 2026-04-02T12:51:43.858Z | 1 | mistralai/mistral-7b-instruct:free | 404 | Model mistralai/mistral-7b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints found  |
| 2026-04-02T12:51:47.136Z | 2 | google/gemini-flash-1.5:free | 404 | Model google/gemini-flash-1.5:free failed (HTTP 404): {"error":{"message":"No endpoints found for go |
| 2026-04-02T12:52:11.956Z | 3 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Provider returned error","code":429,"m |
| 2026-04-02T12:52:12.594Z | 3 | google/gemini-flash-1.5:free | 404 | Model google/gemini-flash-1.5:free failed (HTTP 404): {"error":{"message":"No endpoints found for go |
| 2026-04-02T12:52:12.666Z | 3 | nvidia/nemotron-4-340b-instruct:free | 404 | Model nvidia/nemotron-4-340b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints foun |
| 2026-04-02T12:52:12.750Z | 3 | mistralai/mistral-7b-instruct:free | 404 | Model mistralai/mistral-7b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints found  |
| 2026-04-02T12:52:12.815Z | 3 | meta-llama/llama-3.1-8b-instruct:free | 404 | Model meta-llama/llama-3.1-8b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints fou |
| 2026-04-02T12:52:17.917Z | 4 | mistralai/mistral-7b-instruct:free | 404 | Model mistralai/mistral-7b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints found  |
| 2026-04-02T12:53:14.432Z | 5 | nvidia/nemotron-4-340b-instruct:free | 404 | Model nvidia/nemotron-4-340b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints foun |
| 2026-04-02T12:53:14.517Z | 5 | google/gemini-flash-1.5:free | 404 | Model google/gemini-flash-1.5:free failed (HTTP 404): {"error":{"message":"No endpoints found for go |
| 2026-04-02T12:53:14.598Z | 5 | meta-llama/llama-3.1-8b-instruct:free | 404 | Model meta-llama/llama-3.1-8b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints fou |
| 2026-04-02T12:53:23.354Z | 5 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Provider returned error","code":429,"m |
| 2026-04-02T12:53:23.960Z | 5 | mistralai/mistral-7b-instruct:free | 404 | Model mistralai/mistral-7b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints found  |
| 2026-04-02T12:53:27.273Z | 6 | meta-llama/llama-3.1-8b-instruct:free | 404 | Model meta-llama/llama-3.1-8b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints fou |
| 2026-04-02T12:53:27.825Z | 6 | google/gemini-flash-1.5:free | 404 | Model google/gemini-flash-1.5:free failed (HTTP 404): {"error":{"message":"No endpoints found for go |
| 2026-04-02T12:53:28.342Z | 6 | mistralai/mistral-7b-instruct:free | 404 | Model mistralai/mistral-7b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints found  |
| 2026-04-02T12:53:48.683Z | 7 | google/gemini-flash-1.5:free | 404 | Model google/gemini-flash-1.5:free failed (HTTP 404): {"error":{"message":"No endpoints found for go |
| 2026-04-02T12:53:48.754Z | 7 | mistralai/mistral-7b-instruct:free | 404 | Model mistralai/mistral-7b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints found  |
| 2026-04-02T12:53:48.828Z | 7 | meta-llama/llama-3.1-8b-instruct:free | 404 | Model meta-llama/llama-3.1-8b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints fou |
| 2026-04-02T12:53:48.893Z | 7 | nvidia/nemotron-4-340b-instruct:free | 404 | Model nvidia/nemotron-4-340b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints foun |
| 2026-04-02T12:53:56.434Z | 7 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-02T12:54:00.587Z | 8 | mistralai/mistral-7b-instruct:free | 404 | Model mistralai/mistral-7b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints found  |
| 2026-04-02T12:54:00.713Z | 8 | google/gemini-flash-1.5:free | 404 | Model google/gemini-flash-1.5:free failed (HTTP 404): {"error":{"message":"No endpoints found for go |
| 2026-04-02T12:54:57.471Z | 9 | meta-llama/llama-3.1-8b-instruct:free | 404 | Model meta-llama/llama-3.1-8b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints fou |
| 2026-04-02T12:54:58.251Z | 9 | google/gemini-flash-1.5:free | 404 | Model google/gemini-flash-1.5:free failed (HTTP 404): {"error":{"message":"No endpoints found for go |
| 2026-04-02T12:54:58.360Z | 9 | mistralai/mistral-7b-instruct:free | 404 | Model mistralai/mistral-7b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints found  |
| 2026-04-02T12:55:01.869Z | 9 | openrouter/free | 402 | Model openrouter/free failed (HTTP 402): {"error":{"message":"Provider returned error","code":402,"m |
| 2026-04-02T12:55:02.790Z | 9 | nvidia/nemotron-4-340b-instruct:free | 404 | Model nvidia/nemotron-4-340b-instruct:free failed (HTTP 404): {"error":{"message":"No endpoints foun |
| 2026-04-02T12:55:34.461Z | 12 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T12:55:57.440Z | 15 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T12:56:08.363Z | 16 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:56:09.072Z | 16 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T12:56:40.629Z | 20 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:56:52.733Z | 21 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T12:57:00.638Z | 21 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-02T12:57:48.364Z | 26 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T12:57:55.376Z | 27 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T12:58:08.278Z | 28 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T12:58:49.863Z | 30 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T12:59:00.150Z | 30 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-02T12:59:49.776Z | 36 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T12:59:55.258Z | 36 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T13:00:13.426Z | 37 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T13:00:37.781Z | 40 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:00:44.082Z | 40 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T13:01:10.270Z | 42 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Provider returned error","code":429,"m |
| 2026-04-02T13:01:25.371Z | 44 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:01:31.342Z | 44 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T13:02:34.120Z | 46 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:03:38.172Z | 49 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:03:43.526Z | 49 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T13:03:51.521Z | 49 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T13:05:05.414Z | 53 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T13:05:05.760Z | 53 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:05:27.396Z | 55 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T13:06:33.033Z | 60 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T13:07:02.032Z | 63 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T13:07:09.783Z | 64 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:07:38.772Z | 66 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:07:44.156Z | 66 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T13:08:04.293Z | 67 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Provider returned error","code":429,"m |
| 2026-04-02T13:08:04.492Z | 67 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:09:42.358Z | 73 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T13:11:05.361Z | 75 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:11:18.854Z | 77 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:35:05.227Z | 0 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:35:18.661Z | 1 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T13:35:38.317Z | 2 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T13:35:49.272Z | 3 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T13:36:22.472Z | 6 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:36:42.572Z | 7 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:37:07.296Z | 10 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T13:37:08.226Z | 10 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:37:14.304Z | 10 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T13:37:56.274Z | 11 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T13:38:52.890Z | 14 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Provider returned error","code":429,"m |
| 2026-04-02T13:38:53.576Z | 14 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:38:59.341Z | 14 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T13:39:17.993Z | 15 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T13:40:44.656Z | 18 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T13:41:16.418Z | 19 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:41:30.080Z | 20 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T13:41:30.383Z | 20 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:42:10.369Z | 22 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T13:43:09.812Z | 25 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T13:43:10.115Z | 25 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:43:30.223Z | 27 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:44:52.162Z | 29 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:44:57.972Z | 29 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T13:45:25.900Z | 30 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T13:45:34.268Z | 30 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T13:45:35.736Z | 30 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:45:55.410Z | 30 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:46:30.335Z | 32 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T13:46:39.574Z | 32 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Provider returned error","code":429,"m |
| 2026-04-02T13:46:39.940Z | 32 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:46:45.512Z | 32 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T13:47:23.130Z | 33 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Provider returned error","code":429,"m |
| 2026-04-02T13:47:33.013Z | 33 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T13:47:33.664Z | 33 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:47:39.789Z | 33 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T13:47:44.868Z | 34 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:47:50.760Z | 34 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T13:47:58.608Z | 34 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-02T13:48:04.237Z | 34 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T13:48:13.703Z | 35 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T13:48:19.617Z | 35 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T13:48:26.438Z | 35 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T15:21:58.185Z | 0 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T15:22:42.386Z | 2 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T15:22:47.779Z | 2 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T15:23:52.463Z | 5 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T15:23:57.880Z | 5 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T15:25:04.190Z | 1 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T15:25:04.982Z | 1 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T15:25:39.916Z | 2 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-02T15:25:40.260Z | 2 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T15:25:45.693Z | 2 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T15:26:54.192Z | 5 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-02T15:26:59.777Z | 5 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T15:27:00.058Z | 5 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T15:27:06.973Z | 5 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T15:27:18.498Z | 0 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T15:27:19.187Z | 0 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T15:27:24.880Z | 0 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T18:10:04.382Z | 1 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T18:10:04.743Z | 1 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T18:10:04.894Z | 0 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T18:10:05.156Z | 0 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T18:10:11.202Z | 1 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T18:10:39.765Z | 2 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T18:10:40.731Z | 3 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T18:10:45.219Z | 2 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T18:11:19.783Z | 5 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T18:11:19.789Z | 4 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T18:11:29.579Z | 5 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-02T18:11:29.883Z | 5 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T18:13:19.855Z | 15 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T18:13:25.273Z | 14 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T18:13:25.527Z | 14 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T18:13:34.476Z | 1 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T18:13:34.949Z | 1 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T18:13:41.264Z | 1 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T18:13:49.775Z | 1 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-02T18:13:54.983Z | 16 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T18:14:00.559Z | 16 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T18:14:19.998Z | 19 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T18:14:25.364Z | 19 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T18:14:25.411Z | 18 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T18:14:43.973Z | 21 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T18:14:49.334Z | 21 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T18:15:10.409Z | 22 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T18:15:25.399Z | 4 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T18:15:47.944Z | 25 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Provider returned error","code":429,"m |
| 2026-04-02T18:16:07.195Z | 26 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T18:16:07.726Z | 26 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T18:16:34.118Z | 29 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T18:17:18.385Z | 33 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-02T18:17:24.463Z | 33 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-02T18:17:30.279Z | 33 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T18:17:30.502Z | 33 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T18:17:41.454Z | 35 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-02T18:17:46.871Z | 35 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T18:18:02.467Z | 36 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-02T18:18:07.224Z | 37 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-02T18:18:07.795Z | 36 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-04T19:42:42.700Z | 3 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-04T19:48:29.677Z | 2 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-05T04:27:44.808Z | 6 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-05T04:27:56.549Z | 9 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-05T04:27:56.661Z | 8 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-05T04:28:08.851Z | 11 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-05T04:28:49.429Z | 19 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-05T04:29:12.627Z | 22 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-05T04:29:14.279Z | 23 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-05T04:29:30.312Z | 24 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-05T04:29:40.252Z | 26 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-05T04:29:51.900Z | 29 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-05T04:29:52.143Z | 28 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-05T04:31:53.414Z | 41 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-05T04:32:59.756Z | 49 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-05T04:33:38.997Z | 3 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-05T04:33:47.452Z | 4 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-05T04:34:13.111Z | 9 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-05T04:34:38.975Z | 11 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-05T04:34:49.737Z | 12 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-05T04:35:06.764Z | 15 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-05T04:35:26.114Z | 17 | google/gemini-flash-1.5 | 404 | Model google/gemini-flash-1.5 failed (HTTP 404): {"error":{"message":"No endpoints found for google/ |
| 2026-04-05T04:37:50.680Z | 28 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-05T04:38:33.684Z | 31 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-05T04:40:08.596Z | 35 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-05T04:41:07.624Z | 36 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-05T04:42:16.027Z | 44 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T10:25:15.875Z | 9 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-05T10:43:00.368Z | 0 | openrouter/free | 400 | Model openrouter/free failed (HTTP 400): {"error":{"message":"Provider returned error","code":400,"m |
| 2026-04-05T10:43:25.846Z | 1 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T10:44:28.677Z | 4 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T10:44:29.183Z | 4 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T10:45:30.980Z | 7 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T10:45:40.091Z | 7 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Provider returned error","code":429,"m |
| 2026-04-05T10:45:45.812Z | 7 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T10:46:04.292Z | 8 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T10:46:22.098Z | 9 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T10:59:42.848Z | 0 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T10:59:48.578Z | 0 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:00:02.265Z | 1 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:00:13.407Z | 2 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:00:19.723Z | 2 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-05T11:00:38.197Z | 2 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:00:43.920Z | 2 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:00:47.512Z | 3 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:00:55.954Z | 3 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:01:01.708Z | 3 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:01:07.924Z | 3 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-05T11:01:21.190Z | 4 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:01:42.516Z | 5 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:01:50.260Z | 5 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:01:50.802Z | 5 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:02:31.977Z | 8 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:02:41.182Z | 8 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Provider returned error","code":429,"m |
| 2026-04-05T11:03:00.065Z | 9 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:03:06.600Z | 9 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-05T11:03:16.674Z | 9 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:03:17.146Z | 9 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:03:59.467Z | 0 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:03:59.966Z | 0 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:04:23.522Z | 1 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Provider returned error","code":429,"m |
| 2026-04-05T11:04:24.028Z | 1 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:04:44.444Z | 2 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:04:53.192Z | 3 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:04:58.959Z | 3 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:15:18.021Z | 0 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:15:52.012Z | 2 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:15:58.029Z | 2 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:15:58.243Z | 2 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:16:47.087Z | 5 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Provider returned error","code":429,"m |
| 2026-04-05T11:17:33.686Z | 7 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:17:33.870Z | 7 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:17:49.606Z | 8 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:17:59.156Z | 8 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:17:59.319Z | 8 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:25:51.283Z | 1 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:26:04.929Z | 2 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:26:51.687Z | 3 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:27:38.674Z | 4 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:28:20.560Z | 0 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:28:23.779Z | 1 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Provider returned error","code":429,"m |
| 2026-04-05T11:28:50.171Z | 2 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:29:02.612Z | 8 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:29:03.110Z | 8 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:29:12.004Z | 5 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:29:15.959Z | 9 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:29:21.722Z | 9 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:30:08.526Z | 8 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-05T11:30:11.204Z | 9 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:30:14.654Z | 8 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:30:14.783Z | 8 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:30:16.871Z | 9 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:30:17.053Z | 9 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:48:01.611Z | 0 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:48:01.625Z | 2 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:48:06.849Z | 5 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:48:07.019Z | 0 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:48:07.236Z | 2 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:48:09.907Z | 1 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:48:10.308Z | 3 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:48:15.200Z | 1 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:48:23.376Z | 7 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:48:32.245Z | 12 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:48:36.936Z | 11 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:48:37.107Z | 14 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:48:37.925Z | 16 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:48:38.397Z | 10 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:48:41.013Z | 12 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:48:44.992Z | 14 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-m |
| 2026-04-05T11:48:45.196Z | 14 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:48:49.297Z | 19 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:48:50.442Z | 17 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:48:58.000Z | 19 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-m |
| 2026-04-05T11:49:03.071Z | 19 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:49:41.723Z | 23 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:49:42.049Z | 21 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:49:51.100Z | 23 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:49:52.079Z | 27 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:49:56.402Z | 23 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:49:57.737Z | 27 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:49:59.579Z | 29 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:49:59.644Z | 29 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:50:40.252Z | 30 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:50:40.282Z | 31 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:50:45.846Z | 34 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:50:48.690Z | 35 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:50:48.995Z | 35 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:50:49.143Z | 32 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Provider returned error","code":429,"m |
| 2026-04-05T11:50:51.375Z | 37 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:50:54.606Z | 38 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:50:54.610Z | 34 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Provider returned error","code":429,"m |
| 2026-04-05T11:50:54.842Z | 35 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:50:56.156Z | 36 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:50:56.218Z | 36 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:50:59.767Z | 37 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:50:59.876Z | 38 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:51:14.111Z | 41 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:51:15.709Z | 42 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:51:19.428Z | 44 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:51:19.485Z | 44 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:51:19.830Z | 41 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:51:23.589Z | 48 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:51:28.478Z | 44 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:51:29.767Z | 49 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:51:31.790Z | 47 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:51:31.849Z | 47 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:51:37.144Z | 47 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:56:52.336Z | 4 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:56:52.350Z | 0 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:56:52.368Z | 1 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:57:01.834Z | 7 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:57:10.458Z | 7 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:57:10.753Z | 8 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:57:11.142Z | 9 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:57:11.201Z | 9 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:57:15.962Z | 7 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:57:16.072Z | 8 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:57:16.238Z | 8 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:57:16.493Z | 9 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:57:32.040Z | 14 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:57:32.374Z | 15 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:57:40.068Z | 11 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:57:40.082Z | 15 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:57:40.547Z | 12 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Provider returned error","code":429,"m |
| 2026-04-05T11:57:40.703Z | 17 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:57:45.716Z | 15 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:58:39.346Z | 22 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:58:39.364Z | 24 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:58:39.369Z | 25 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:58:47.632Z | 23 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:58:47.802Z | 20 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:58:48.365Z | 24 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T11:58:52.549Z | 28 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:58:53.032Z | 23 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:58:53.085Z | 23 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:58:53.185Z | 20 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:58:53.243Z | 20 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:58:53.573Z | 26 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:58:53.836Z | 24 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:58:57.937Z | 28 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:59:41.815Z | 30 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:59:47.138Z | 31 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:59:47.418Z | 35 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:59:47.496Z | 33 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T11:59:47.655Z | 31 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:59:51.521Z | 36 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:59:51.741Z | 37 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T11:59:56.911Z | 36 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T12:00:07.308Z | 39 | openrouter/free | 429 | Model openrouter/free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: free-models-per-d |
| 2026-04-05T12:00:07.475Z | 39 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T12:00:13.508Z | 39 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-05T12:00:18.836Z | 39 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T12:00:20.582Z | 45 | sourceful/riverflow-v2-fast-preview | 402 | Model sourceful/riverflow-v2-fast-preview failed (HTTP 402): {"error":{"message":"Insufficient credi |
| 2026-04-05T12:00:26.107Z | 40 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T12:00:26.558Z | 44 | stepfun/step-3.5-flash:free | 429 | Model stepfun/step-3.5-flash:free failed (HTTP 429): {"error":{"message":"Provider returned error"," |
| 2026-04-05T12:00:32.310Z | 44 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
| 2026-04-05T12:00:37.995Z | 48 | openrouter/free | 402 | Model openrouter/free failed (HTTP 402): {"error":{"message":"Provider returned error","code":402,"m |
| 2026-04-05T12:00:39.176Z | 49 | liquid/lfm-2.5-1.2b-thinking:free | 429 | Model liquid/lfm-2.5-1.2b-thinking:free failed (HTTP 429): {"error":{"message":"Rate limit exceeded: |
