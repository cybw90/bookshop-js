# bookshop-js

A simple book store API in need of input validation/sanitization.

This is a part of the University of Wyoming's Secure Software Design Course (Spring 2023). This is the base repository to be forked and updated for various assignments. Alternative language versions are available in:

- [Go](https://github.com/andey-robins/bookshop-go)
- [Rust](https://github.com/andey-robins/bookshop-rs)

## Versioning

`bookshop-js` is built with:

- node version v16.19.0
- npm version 9.6.2
- nvm version 0.39.3

## Usage

Start the api using `npm run dev`

I recommend using [`httpie`](https://httpie.io) for testing of HTTP endpoints on the terminal. Tutorials are available elsewhere online, and you're free to use whatever tools you deem appropriate for testing your code. 

## Analysis of Existing Code:

1.	Analysis of existing code: 

There are several security concerns that need to be addressed:

•	Authentication and authorization limitation: Anyone can access and modify the bookstore's information without proper authentication and authorization checks.     This can lead to unauthorized access and manipulation of sensitive data.
•	SQL injection vulnerability: The code uses string concatenation to form SQL queries, which can allow attackers to inject malicious SQL code and gain unauthorized access to the database or modify data.
•	Lack of input validation: The code does not validate the input received from users, which can lead to several security concerns such as SQL injection, cross-site scripting (XSS), and buffer overflow attacks.

2.	Input validation to prevent bad input: To prevent bad input, I implemented input validation for each API endpoint to ensure that the input received is of the expected format and does not contain any bad input/ malicious code. I used express validator library to validate the request body, query parameters, and headers for each API endpoint. Additionally, used data types and constraints defined in the database schema to validate the input before inserting or updating the data in the database.

3.	Input validation returns meaningful errors and professional logging: When invalid input is received, it returns a meaningful error message to the user, indicating what input was invalid and why. This can help users correct their input and prevent them from making the same mistake in the future. Moreover, it logs any errors or exceptions that occur during input validation and store them in a secure and centralized log management system. This can help to identify and troubleshoot any issues that arise during the application's development.

4.	Clean code: to ensure clean code I try best to use of meaning full variable and followed consistent code formatting and indentation. Moreover, practiced the use meaning full comments to explain each section.
