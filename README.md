<div align="center">
  <img src="https://www.jotform.com/resources/assets/podo/podo_4.png" width="400px" height="auto" style="border-radius:5%">
<br/ >
</div>

#
### Podo (JotForm's Discord Bot)

Manage your surveys, application forms, community events and more over Discord with JotForm's powerful infrastructure. Developed under Podo's supervision!

#
### Podo's Features 📝

- You can register to our platform or login to your existing Jotform account over Podo. (Discord DM's)
- You can create beautiful forms, surveys with Podo's help!
- You can track submissions in realtime via a text channel of your choice! (Or on Discord DM's)

> **You will want Podo on your server because:**

- 🤨 **You have a large community server and you are hosting an event for which you need applications.**
- 🐱 Podo can help you create a beautiful form through **Discord** or create your own application form with over [10,000 templates](https://www.jotform.com/form-templates/), if you don't like any template, create your own design through our Form Builder!

* 🤨 **You are looking for moderators/admins, but you can't keep up with DM's.**
* 🐱 You can easily create a form with Podo and can track realtime with [JotForm Tables](https://www.jotform.com/products/tables/) or on **Discord** as well!

- 🤨 **You're a streamer and a great new game is out but you think it's not for your audience, you need their feedback.**
- 🐱 Create a survey with a few minutes, tell Podo to share form on specified text channel! See your overall reports with [Report Builder](https://www.jotform.com/products/report-builder/). You can even create a PDF!

* 🤨 **You are an Esports manager and you are getting registrations for your new tournament.**
* 🐱 Fire up a new form for team applications, collect submissions via **Discord**, examine them carefully over [JotForm Tables](https://www.jotform.com/products/tables/). You can even automate approval process with [JotForm Approvals](https://www.jotform.com/products/approvals/).



<div align="center">
<br/ >
  <img src="https://www.jotform.com/resources/assets/podo/podo_11.png" width="300px" height="auto" style="border-radius:5%">
<br/ >
</div>

**It's worth mentioning:**

- You will get an email notification with every submission.
- You can collect submissions via Discord or on Web browser. (Gotta say they look dope! 😻).
- You can create forms via Discord as well as Web browser. (Our Form Builder is pretty neat; drag and drop, widgets, hundreds of styles, online payments..)
- You can automate your approval process via Web browser. (It's not possible via Discord unfortunately)
- And more is waiting for you to explore!

#
### Technical Features for Geeks 💠


- [x] Built-in cool and beautiful looking message embeds.
- [x] Auto permission checks.
- [x] Sharding.
- [x] Users JotForm API keys are safe and secure in our bots database. (Encrypted with AES256).
- [x] Auto discovery and implementation of new commands/events. (Developers, You can add a new command in minutes!)
- [x] You can self host our bot if you want! (If you want to change bots name and logo etc.)

<div align="center">
<br/ >
  <img src="https://www.jotform.com/resources/assets/podo/podo_13.png" width="300px" height="auto" style="border-radius:5%">
<br/ >
</div>

#
### Development Environment

First of all install MongoDB and Redis locally or pass a development MongoDB & Redis URI to `.env`.

- Create `.env` file. You can find the example in [.env.example](.env.example).
- Install dependencies.

`npm install`

- Run.

`npm run dev`

- You can run in production mode with:
  - `sudo npm run start:express` (You have to create a SSL certificate. Please check [ready.js:162](https://gitlab.com/bw3u/podo/-/blob/main/bot/events/ready.js#L162)) **Not Recommended! This is for testing porposes!**
  - `npm run start:nginx` (Reverse proxy, you can find the configuration in [nginx.conf](nginx.conf))


#
### Deployment

> Docker Compose

- Create **`.env`** file carefully, accordingly to **`.env.example`**.
  - `$ mv .env.example` `.env`
  - `$ vim .env`
- Edit **`nginx.conf`** for your taste.
- Run:
  - `$ docker-compose up --build`
- If there is no issue, you can run in detached mode with:
  - `$ docker-compose up -d`

## License

- This project is under the [AGPL-3.0](LICENSE.md) license.
- Copyright © 2021 JotForm Inc. and it's contributors.

<div align="center">
<br />
  <img src="https://www.jotform.com/resources/assets/logo/jotform-logo-transparent-400x100.png" width="200px" height="auto" style="border-radius:5%">
<br/ >
</div>
