const { SlashCommandBuilder,EmbedBuilder } = require('discord.js');
const mult = require("poly-mult-fft")
// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { firebaseConfig }=require("../../config.json")
const { getFirestore } =require("firebase/firestore")
const { collection, setDoc, doc } =require("firebase/firestore"); 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration



// Initialize Firebase
initializeApp(firebaseConfig);
const db=getFirestore()
const {generate_equation,equation_to_string,Solutions_to_string,Synthetic_division,Synthetic_division_to_string} = require('../../equation/equation')
const min_value=-10
const max_value=10
const collectorFilter = response => {
	return true
};
function non_zero_random(){
	const r=Math.floor(Math.random()*(max_value-min_value)+min_value);//랜덤 하나 만들어서
	if(r==0){//0이면 다시 ㄲ
		return non_zero_random()
	}
	return r//아님 리턴
}
function random_rational(x){
	l=[]
	let a,b;
	while(l.length<x){
		a=Math.floor(Math.random()*max_value)
		b=non_zero_random()
		if(a%b!=0){
			l[l.length]=[a,b]
		}
	}
	return l
}
function text_to_solutions(text){
	return text.replaceAll(' ','').split(',')
}
function make_foli(e,rs,qs){
	console.log('b',e,rs,qs)
	let e_=e;
	re_text=''
	for(const r of rs){
		let re=Synthetic_division(r[0],e_)
		console.log('k',re,r)
		e_=re.result
		re_text+=`**조립제법**
\`\`\`c
${Synthetic_division_to_string(...re.information)}
\`\`\`

`
	}
	console.log('c',e_)
	if(e_.length>2){
		re_text+=`**인수분해**
\`${equation_to_string(e_).replaceAll('x','𝑥').replaceAll('+',' + ').replaceAll('-',' - ')}=${Solutions_to_string(qs).replaceAll('x','𝑥').replaceAll('+',' + ').replaceAll('-',' - ')}\``
	}
	return re_text
}
module.exports = {
	data: new SlashCommandBuilder()
		.setName('연습문제_대수학')
		.setDescription('방정식을 문제를 냅니다')
		.addIntegerOption(option=>
			option.setName('차수')
			.setDescription('방정식의 차수를 설정합니다.')
			.setMinValue(1)
			.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();
        const gcd = (a, b) => a % b === 0 ? b : gcd(b, a % b);
		let solution=[...(Array(interaction.options.getInteger('차수')-parseInt(interaction.options.getInteger('차수')/2)).fill(0)).map((e)=>[Math.floor(Math.random()*(max_value-min_value)+min_value),1]),...random_rational(parseInt(interaction.options.getInteger('차수')/2))]
		solution=solution.map(e=>[e[0]/gcd(...e),e[1]/gcd(...e)])
        console.log(solution)
        const text_solution=solution.map(e=>{
			if(e[1]>0){
				if(e[1]===1){
					return `${e[0]}`
				}else{
					return `${e[0]}/${e[1]}`
				}
			}else{
				if(e[1]===-1){
					return `-${e[0]}`
				}else{
					return `-${e[0]}/${-e[1]}`
				}
			}
		})
        const data=generate_equation(solution)
		console.log(data)
		let result=equation_to_string(data.Expansion)
		console.log(result)
		result.replaceAll('x','𝑥').replaceAll('+',' + ').replaceAll('-',' - ')
		const answer_embed=(win,time)=>new EmbedBuilder()
		.setTitle(win?'**맞았어요!**':'**타임아웃!**')
		.setDescription(`답을 서술해놓았어요.

${make_foli(data.Expansion,solution.filter(e=>e[1]==1),solution.filter(e=>e[1]!=1))}

**근**

\`${text_solution.join(', ')}\``)
		.setColor(0x0099FF)
		.setFooter({ text: `걸린시간ㆍ${time}초` })
		const embed=new EmbedBuilder()
		.setDescription(`**문제**
		${result} = 0

		식을 만족하는 𝑥를 모두 구하여 채널에 보내주세요.
		답은 콤마로 구분되어야 합니다.
		순서는 중요하지 않습니다.

		**제한시간**
		${interaction.options.getInteger('차수')}분`)
		.setColor(0x0099FF)
		.setFooter({ text: 'MP equation problem bot' });
		console.log(text_solution)
		console.log(text_solution.join(','))
        await interaction.editReply({ embeds: [embed],fetchReply: true})
		const collectorFilter = m => /^(?:([0-9/ -]+),)*([0-9/ -]+)$/.test(m.content);
		//console.log(interaction.channel)
		const collector = interaction.channel.createMessageCollector({ filter: collectorFilter, time: 1000*60*interaction.options.getInteger('차수') });
		let start_time=new Date().getTime()
		let correct_flag=false
		collector.on('collect', async m => {
			if(JSON.stringify([...text_solution].sort())===JSON.stringify([...text_to_solutions(m.content)].sort())){
				console.log(`${m.author}님에 정답!`)
				console.log(m)
				const time=(new Date().getTime()-start_time)/1000
				// const scoreRef = collection(db,'score',m.guildId)//db.collection('score').doc(m.guildId)
				//이거 안되뮤ㅠ
				const data={[`${interaction.options.getInteger('차수')}.${m.author.id}`]:time,}
				await setDoc(doc(db, "score", m.author.id), {
					[`scores.${interaction.options.getInteger('차수')}`]:time,
					name:m.author.username,
					id:m.author.id
				}, {merge: true});
				m.reply({ embeds:[answer_embed(true,time)]})
				correct_flag=true
				collector.stop()
			}else{
				m.react("🔴")
			}
		});
		collector.on('end', collected => {
			if(!correct_flag){
				interaction.followUp({ embeds:[answer_embed(false,(new Date().getTime()-start_time)/1000)]})
			}
		});
	},
};