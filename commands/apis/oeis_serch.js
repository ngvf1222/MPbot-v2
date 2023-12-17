const { SlashCommandBuilder,hyperlink } = require('discord.js');
const axios = require('axios');
// const options = {
//   method: 'GET',
//   url: 'https://numbersapi.p.rapidapi.com/random/math'
// };


module.exports = {
	data: new SlashCommandBuilder()
		.setName('수열_검색')
		.setDescription('OEIS에서 수열을 검색합니다.')
    .addStringOption(option =>
      option.setName('내용')
      .setDescription('내용')
      .setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();
    const id=interaction.options.getString('내용')
		const options={
      method:'GET',
      url:`https://oeis.org/search?q=${id}&fmt=json`
    }
    let info=await axios.request(options)
    //console.log(`https://oeis.org/search?q=id:${id}&fmt=json`,info,info.data)
    console.log(info,info.data,info.data.results)
    if(info.data.count==0){
      await interaction.editReply('수열이 없습니다.')
    }else{
      info=Array.from(info.data.results).slice(0,5)
      console.log(typeof info)
      const link=e=>hyperlink(e.name,`https://oeis.org/A${(e.number+'').padStart(6, '0')}`)
      const formating_=e=>{
        let prss_info=e.data//.replaceAll(id.replaceAll(' ',''),`\`${id.replaceAll(' ','')}\``)
        return prss_info//[prss_info.length-1]=='`'?prss_info+' ':prss_info
      }
      info=info.map(e=>`**${link(e)}**(A${(e.number+'').padStart(6, '0')})
\`${formating_(e)}\``).join('\n')
      await interaction.editReply(info)
    }
	},
};