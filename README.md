# Flick Pick

[![Angular](https://img.shields.io/badge/Angular-12.0.0-red)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Node.js-14.17.6-green)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0.25-blue)](https://www.mysql.com/)
[![TMDB API](https://img.shields.io/badge/TMDB%20API-Official-yellow)](https://www.themoviedb.org/documentation/api)

[Flick Pick Live Demo](https://flick-pick.jerome-baille.fr)

Flick Pick is a collaborative movie and TV show selection platform that allows users to create groups, add media items (movies and TV shows), vote on what to watch, maintain personal lists, and keep favorite items.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Integration](#api-integration)
- [Contributing](#contributing)
- [License](#license)
- [Authors](#authors)
- [Contact Information](#contact-information)
- [Acknowledgments](#acknowledgments)

## Technologies Used

- Frontend:
  - Angular
  - SASS (Indented)
  - Angular Material (Mat Angular)

- Backend:
  - Node.js
  - Express.js

- Database:
  - MySQL
  - Sequelize (ORM)

## Features

- User Authentication:
  - Register, log in, and log out.

- Group Creation:
  - Users can create groups of members.

- Media Item Management:
  - Add movies and TV shows to groups.
  - Vote on media items within groups to decide what to watch.

- Personal Lists:
  - Users can have personal lists that are not attached to a group.

- Favorites:
  - Mark media items as favorites for personal use.

## Installation

To run the Flick Pick app locally, follow these steps:

1. Clone this repository.
2. Navigate to the frontend and backend directories and install dependencies using `npm install`.
3. Set up your MySQL database and update the configuration in the backend.
4. Run the backend server using `npm start` in the backend directory.
5. Run the frontend using `ng serve` in the frontend directory.

## Usage

1. Register or log in to your account.
2. Create groups and add members.
3. Add movies and TV shows to groups.
4. Vote on media items within groups to decide what to watch.
5. Maintain personal lists and mark favorite items.

## API Integration

Flick Pick uses the TMDB API for fetching media data. You will need to obtain your API key from the TMDB website and configure it in the backend.

## Contributing

Contributions to Flick Pick are welcome. Please submit issues or pull requests.

## License

This project is licensed under the MIT License.

## Authors

- [Jerome BAILLE](https://github.com/Jerome-Baille) - Frontend Development
- [Jerome BAILLE](https://github.com/Jerome-Baille) - Backend Development

## Contact Information

For questions or support, please contact me through [my website](https://jerome-baille.fr).

## Acknowledgments

- Thanks to the Angular, Node.js, and Sequelize communities for their fantastic tools and libraries.
- Special thanks to the TMDB API for providing media data.