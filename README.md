# PlayNex

# What is PlayNex?

PlayNex is a robust backend for a YouTube-like video streaming application, integrating MongoDB for data persistence and Cloudinary for media management. It provides secure, RESTful API endpoints documented using Swagger for ease of development and testing.

The project focuses on delivering a wide range of APIs related to user authentication and authorization and video streaming ans also tweets, enabling developers to seamlessly integrate these APIs into their applications.

Key highlights of the PlayNex project include:

1. **Robust Video Streaming:** PlayNex powers a YouTube-like video streaming service, delivering high-quality video content API's from Cloudinary. It also suppoorts HLS and DASH streaming.

2. **Scalable Architecture:** Built on top of MongoDB for data persistence and Cloudinary for efficient media management, PlayNex is designed to scale with your user base and content demands.

3. **Secure and Flexible API:** With comprehensive RESTful endpoints and integrated user authentication, PlayNex ensures secure access while offering flexible integration options for frontend applications.

4. **Developer-Friendly Documentation:** Detailed API documentation is provided via Swagger, enabling developers to quickly understand and integrate with the available endpoints.

# 📝 Features

PlayNex offers a wide range of features to support video streaming and social media applications, including:

1. **User Authentication:** Secure user authentication and authorization using JWT tokens.

2. **Video Streaming:** API endpoints to fetch video content from Cloudinary and stream videos using HLS and DASH.

3. **Tweet Management:** Create, read, update, and delete tweets using RESTful API endpoints.

4. **User Profile Management:** Manage user profiles, including user details and profile pictures.

5. **Swagger Documentation:** Interactive API documentation using Swagger for easy testing and integration.

6. **MongoDB Integration:** Seamless integration with MongoDB for data persistence and management.

7. **Cloudinary Integration:** Efficient media management using Cloudinary for video and image content.

# 📦 Tech Stack

PlayNex is built using the following technologies:

1. **Node.js:** A JavaScript runtime built on Chrome's V8 JavaScript engine.

2. **Express.js:** A minimal and flexible Node.js web application framework.

3. **MongoDB:** A NoSQL database for efficient data storage and retrieval.

4. **Cloudinary:** A cloud-based media management platform for image and video content.

5. **Swagger:** An open-source software framework backed by a large ecosystem of tools that helps developers design, build, document, and consume RESTful web services.

6. **JWT:** JSON Web Tokens for secure user authentication and authorization.

7. **Docker:** A platform for developing, shipping, and running applications in containers.

8. **PM2:** A production process manager for Node.js applications with a built-in load balancer.

# 📊 ER Diagram

The Entity-Relationship Diagram (ERD) for PlayNex provides a visual representation of the database schema, showcasing the relationships between different entities within the system. This diagram is essential for understanding the data structure and how various components interact with each other.

You can view the detailed ERD by clicking on the link below.
[ERD](https://app.eraser.io/workspace/EZNlt2ORc3GmaiVVmdX0?origin=share)

# 🏁 Installation

### 1. 🐳 Using Docker (recommended)

To run the FreeAPI project, follow these steps:

1. Install [Docker](https://www.docker.com/) on your machine.
2. Clone the project repository.
3. Navigate to the project directory.
4. Create `.env` file in the root folder and copy paste the content of `.env.sample`, and add necessary credentials.
5. Run the Docker Compose command:

```bash
docker-compose up --build --attach playnex

# --build: Rebuild the image and run the containers
# --attach: only show logs of Node app container and not mongodb
```

If you want to run the project in the background, you can use the following command:

```bash

docker-compose up --build -d playnex

```

6. Access the project APIs at the specified endpoints.

### 2. 💻 Running locally

To run the project locally, follow these steps:

1. Install [PNPM](https://pnpm.io/installation), [NodeJs](https://www.nodejs.org/), [MongoDB](https://www.mongodb.com) and [MongoDB Compass (optional)](https://www.mongodb.com/products/compass) on your machine.
2. Clone the project repository.
3. Navigate to the project directory.
4. Create `.env` file in the root folder and copy paste the content of `.env.sample`, and add necessary credentials.
5. Install the packages:

```bash
pnpm install
```

6. Run the project:

```bash
pnpm run dev
```

or if you want to run the project using the pm2 process manager, you can use the following command:

```bash
pnpm run start
```

7. Access the project APIs at the specified endpoints.

### 3. 🚄 Using Railway (One-click Deploy)

To self-host the FreeAPI.app application, you can take advantage of a pre-built template that is readily available.

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template/zYfM2t?referralCode=uDfR9l)

1. Click the button above to visit railway.app.

2. Click on the **Deploy Now** button.

3. (Optional) Sign in with GitHub to deploy.

4. Fill in the Repository details:

   - Specify the repo name of your choice.
   - Checkmark for Public/Private repository.

5. For Environment variables, we have provided some default values in the `ENV` to reduce the burden, but you can modify them as per your requirements.

7. Once you fill in the required environment parameters click on the **Deploy** button to trigger the first build.

   -  Monitor the server logs; if you come across any deployment problems, feel free to raise an issue for our team to look into.

Note: Once the application is deployed, please wait for 3-5 minutes for the swagger docs to be available. As the project is deployed on a free server, it may take a few seconds to load the Swagger documentation. So please be patient.

# 📚 Interactive API Documentation

*Swagger Docs:* https://playnex-backend.onrender.com/api-docs

**NOTE:**  As the project is deployed on a free server, it may take a few seconds to load the Swagger documentation. So please be patient. The Swagger documentation is available for the deployed version of the project. If you are running the project locally, you can access the Swagger documentation at `http://localhost:8080/api-docs`.

## 🚀 Contribute by creating frontend application:

If you are interested in contributing to the project by creating a frontend application using these API endpoints, you can follow these steps:

1. Clone the project repository.
2. Create a frontend application using your preferred framework (React, Angular, Vue, etc.). You can also use the components library like Bootstrap, Material-UI, Shadcn, etc.
3. Use the API endpoints provided in the Swagger documentation to fetch data and display it in your frontend application.
4. You can also contribute by creating a sample frontend application using the API endpoints and submitting a pull request to the project repository.

## 🤝 Acknowledgements

We would like to extend our heartfelt thanks to [Hitesh Choudhary (Chai aur Code)](https://www.youtube.com/@chaiaurcode) for inspiring this project through his insightful tutorials on YouTube. His dedicated [playlist](https://youtube.com/playlist?list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&si=I_MUBNjacjYEdALc) has been an invaluable resource in understanding modern web development practices. And inspired by his open source project FreeAPI I have also integrated the some of the features in this project.
