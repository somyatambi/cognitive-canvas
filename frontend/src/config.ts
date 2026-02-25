// API Configuration
// For production: Set VITE_API_URL in Vercel environment variables
// For local dev: Use Docker gateway (8080) which has all agents (brainstormer, critic, roadmap, tasks, pitchdeck)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default API_BASE_URL;
