## Packages
framer-motion | Page transitions and stunning micro-interactions
react-dropzone | Beautiful drag-and-drop file upload for the documents page

## Notes
The backend handles RAG via OpenAI. The POST /api/chat endpoint is assumed to handle the user message and generate the assistant response before returning, or we simply invalidate the chat query to refetch the full updated history including the AI's reply.
Documents upload expects multipart/form-data with 'file', 'className', and 'subject'.
