const { SlashCommandBuilder,EmbedBuilder } = require('discord.js');
const axios = require('axios');
// const options = {
//   method: 'GET',
//   url: 'https://numbersapi.p.rapidapi.com/random/math'
// };


module.exports = {
	data: new SlashCommandBuilder()
		.setName('수열_정보_검색')
		.setDescription('OEIS에서 수열의 정보를 봅니다')
    .addStringOption(option =>
      option.setName('id')
      .setDescription('수열 고유번호(A+6자리 숫자)')
      .setRequired(true)),
	async execute(interaction) {
    await interaction.deferReply();
    const id=interaction.options.getString('id')
		const options={
      method:'GET',
      url:`https://oeis.org/search?q=id:${id}&fmt=json`
    }
    let info=await axios.request(options)
    //console.log(`https://oeis.org/search?q=id:${id}&fmt=json`,info,info.data)
    info=info.data.results[0]
    infos=Object.keys(info).map((e,i)=>{return {name:e,value: (Array.isArray(info[e]))?info[e].join('\n'):''+info[e],inline: true}})
    console.log(infos)
    const infoEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle(id)
      .setURL(`https://oeis.org/${id}`)
      .setDescription('Some description here')
      .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/f/ff/OEIS_icon.png')
      .addFields(
        ...infos.slice(0,2),
        infos[3],
        { name: '\u200B', value: '\u200B' },
        infos[2]

        // ...infos.slice(3,6),
        // { name: '\u200B', value: '\u200B' },
        // ...infos.slice(6,9),
        // ...infos.slice(9,12),
        // { name: '\u200B', value: '\u200B' },
        // ...infos.slice(12,15),
        // ...infos.slice(15,18),
        // { name: '\u200B', value: '\u200B' },
        // ...infos.slice(18,21)
      )
      .setImage(`https://oeis.org/${id}/graph?png=1`)
      .setTimestamp()
    await interaction.editReply({ embeds: [infoEmbed] })
  }
};