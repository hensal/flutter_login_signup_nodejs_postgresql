# Simple Login Signup application

Step1:
create the .env folder inside the server folder inside the project 
and write the below.
Note: This is generated from the google api so that we can send the forgot password link to individual user 
using this email.This is just the demo, you need to create user and pass from google console as shown in screenshot below.
LInk:https://myaccount.google.com/

     EMAIL_USER=kn55@gmail.com   
     EMAIL_PASS=pkyz kwuc uiqu ztqd

![app](https://github.com/user-attachments/assets/ad13c629-eff4-40c7-8b94-4323a87a04f4)


![google](https://github.com/user-attachments/assets/6e0d7b28-f7dd-47d9-aafa-c3379fc73de8)


 

Step-2:
Here, I used NodeJS for the back with the node nodemailer to send the email link to user.

Step-3:
In the index.html file inside the Web folder of flutter application. Write below code.

      <base href="/">

Step-4:
Packages are listed below:

      go_router: ^14.8.0
      intl_phone_field: ^3.2.0
      http: ^0.13.4

Step-5:
The # sing in the URL route might give the error will reseting the password.
SO use setUrlStrategy package of flutter in web application

UI:

![login](https://github.com/user-attachments/assets/442cc9cd-2274-4790-943d-852b30867737)


![resister](https://github.com/user-attachments/assets/621c10cc-d236-4889-8da7-9438cbd5fcbb)


![forgot](https://github.com/user-attachments/assets/18733af7-4e45-4f5b-8b00-3ca5ab2d9d65)

