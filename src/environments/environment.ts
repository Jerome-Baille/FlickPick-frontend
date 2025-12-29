const apiBaseURL = 'http://localhost:3000/api';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
const TMDB_IMAGE_BASE_URL_300 = 'https://image.tmdb.org/t/p/w300';
const TMDB_BASE_API_URL = 'https://api.themoviedb.org/3';

export const environment = {
  production: false,
  // In development, we use local mock auth instead of external service
  authBaseURL: apiBaseURL,
  authFrontURL: '', // Not used in dev mode
  authURL: `${apiBaseURL}/auth`,
  userURL: `${apiBaseURL}/user`,
  groupURL: `${apiBaseURL}/group`,
  listURL: `${apiBaseURL}/list`,
  mediaURL: `${apiBaseURL}/media`,
  voteURL: `${apiBaseURL}/vote`,
  tmdbUrl: `${apiBaseURL}/tmdb`,
  TMDB_IMAGE_BASE_URL,
  TMDB_IMAGE_BASE_URL_300,
  TMDB_BASE_API_URL,
  redirectUrl: 'http://localhost:4200/login'
};