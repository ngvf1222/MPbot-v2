const { SlashCommandBuilder,EmbedBuilder,MessageAttachment } = require('discord.js');
const { VoiceConnectionStatus, AudioPlayerStatus,joinVoiceChannel,getVoiceConnection } = require('@discordjs/voice');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('그만')
		.setDescription('재생을 그만둡니다.'),
	async execute(interaction) {
        await interaction.deferReply();
        const channel = interaction.member.voice.channel
        getVoiceConnection(channel.guild.id).disconnect();
        await interaction.editReply('음성 채널을 나갔습니다.')
    }
};