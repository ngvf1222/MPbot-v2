const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const options = {
  method: 'GET',
  url: 'https://numbersapi.p.rapidapi.com/random/math',
  headers: {
    'X-RapidAPI-Key': '421d128506msh2ba6563b729cd42p1861b4jsn35e97faa6c95',
    'X-RapidAPI-Host': 'numbersapi.p.rapidapi.com'
  }
};


module.exports = {
	data: new SlashCommandBuilder()
		.setName('자연수_농담')
		.setDescription('숫자의 관한 재밌는 사실'),
	async execute(interaction) {
		await interaction.deferReply();
		try {
            const response = await axios.request(options);
            await interaction.editReply(response.data)
        } catch (error) {
            console.error(error);
            await interaction.editReply('에러발생')
        }
	},
};