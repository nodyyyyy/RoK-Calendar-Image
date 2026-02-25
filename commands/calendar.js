const { SlashCommandBuilder } = require('discord.js');
const generateCalendarImage = require('../calendarEngine');
const { google } = require('googleapis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('calendar')
    .setDescription('Show monthly kingdom calendar'),

  async execute(interaction) {

    await interaction.deferReply();

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/calendar.readonly']
    );

    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: new Date(year, month, 1).toISOString(),
      timeMax: new Date(year, month + 1, 0).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items.map(e => ({
      title: e.summary,
      start: e.start.dateTime || e.start.date,
      end: e.end?.dateTime || e.end?.date,
      color: '#5a3ea1'
    }));

    const buffer = generateCalendarImage(year, month, events);

    await interaction.editReply({
      files: [{
        attachment: buffer,
        name: 'calendar.png'
      }]
    });
  }
};
