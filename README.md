# Healthcare-Online

This project is the backend system for an online healthcare platform, providing comprehensive functionalities for administrators, doctors, and patients. The platform includes features for managing categories, reservations, reviews, payments, real-time chat, and notifications. It supports both Arabic and English languages.

## API Documentation

The API documentation is available [here](https://documenter.getpostman.com/view/26559299/2s9YkjCjZN).

## Project Overview

Healthcare-Online was developed by a dedicated team of developers. As a key contributor, I played a crucial role in designing and implementing the backend API, ensuring its scalability, security, and reliability. My responsibilities included integrating the API with external services and maintaining clear, detailed documentation.

## Technologies Used

The backend was developed using the following technologies: Express.JS, MongoDB

## Key Features

### For Patients

| Feature                     | Description                                                                                              |
| --------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Appointment Scheduling**   | Enables patients to choose a suitable date and time with their selected doctor.                          |
| **Doctor Selection**         | Provides a range of experienced doctors, allowing patients to browse profiles and book appointments.      |
| **Direct Communication**     | Facilitates messaging between patients and their chosen doctors through the platform.                    |

### For Doctors

| Feature                     | Description                                                                                              |
| --------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Availability Management**  | Allows doctors to manage their available times, view booked slots, and update their schedules easily.     |
| **Patient Interaction**      | Enables doctors to communicate directly with patients who have booked appointments.                       |
| **Comprehensive Dashboard**  | Offers a detailed overview of activities, tasks, and appointments within the platform.                    |

## Database Collections

| Collection   | Description                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **Admin**    | Manages the entire system, including the addition and removal of doctors, patients, and categories. Also provides access to reports and analytics. |
| **Doctors**  | Allows doctors to register, select their specialization, and manage appointments.                                        |
| **Patients** | Enables patients to register, view upcoming appointments, leave reviews, and communicate with doctors via chat.          |
| **Categories** | Allows admins to create and manage categories, helping patients find doctors with the right expertise.                   |
| **Reservations** | Manages appointment bookings, generating a calendar of available times for patients to choose from.                     |
| **Reviews**  | Facilitates the exchange of feedback between patients and doctors, helping others make informed healthcare decisions.    |
| **Chat**     | Provides real-time communication between patients and doctors, supporting inquiries, feedback, and appointment scheduling. |

## License

This project is licensed under the [MIT License](LICENSE).
