# Telegram bot that allows you to replace text in messages with hyperlinks in channels.

For example if you want to transform this: 
'Pink Floyd is nice'
in this:
'<a href="https://ro.wikipedia.org/wiki/Pink_Floyd">Pink Floyd</a> is nice'
Follow these steps:
1. Add the bot to your channel as an admin.
2. Add the bot to your channel chat as an admin(needed for commands).
3. In the chat type something like: 
/addtrig Pink Floyd https://ro.wikipedia.org/wiki/Pink_Floyd
4. Done
5. To remove it: /rmtrig Pink Floyd


# Installation and local launch

1. Clone this repo: `git clone https://github.com/Moldoteck/WordEnhancerBot`
2. Launch the [mongo database](https://www.mongodb.com/) locally
3. Create `.env` with the environment variables listed below
4. Run `yarn install` in the root folder
5. Run `yarn develop`

And you should be good to go! Feel free to fork and submit pull requests. Thanks!

# Environment variables

- `TOKEN` — Telegram bot token
- `MONGO` — URL of the mongo database
- `OWNER_ID` — id of the bot owner

Also, please, consider looking at `.env.sample`.

# License

MIT — use for any purpose. Would be great if you could leave a note about the original developers. Thanks!

Inspired from: https://github.com/Moldoteck/telegraf-template