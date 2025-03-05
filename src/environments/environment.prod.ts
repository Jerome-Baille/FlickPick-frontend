const authFrontURL = 'https://auth.jerome-baille.fr';
const authBaseURL = 'https://auth.jerome-baille.fr/api';
const flickPickBaseURL = 'https://flick-pick.jerome-baille.fr/api';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
const TMDB_IMAGE_BASE_URL_300 = 'https://image.tmdb.org/t/p/w300';
const TMDB_BASE_API_URL = "https://api.themoviedb.org/3";

export const environment = {
  production: true,
  authBaseURL,
  authFrontURL,
  authURL: `${authBaseURL}/auth`,
  userURL: `${flickPickBaseURL}/user`,
  groupURL: `${flickPickBaseURL}/group`,
  listURL: `${flickPickBaseURL}/list`,
  mediaURL: `${flickPickBaseURL}/media`,
  voteURL: `${flickPickBaseURL}/vote`,
  tmdbUrl: `${flickPickBaseURL}/tmdb`,
  TMDB_IMAGE_BASE_URL,
  TMDB_IMAGE_BASE_URL_300,
  TMDB_BASE_API_URL
};