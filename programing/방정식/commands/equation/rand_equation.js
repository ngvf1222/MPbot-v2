const { SlashCommandBuilder } = require('discord.js');
const mult = require("poly-mult-fft")
const eq = require('../../equation')
const min_value=-10
const max_value=10
function to_number(a,b){
	return (Math.abs(a)-1)*(max_value+1)+Math.abs(b)//티어
}
function comparison(a,b){
	//console.log([a,b])
	//console.log([filter_(`(${a[1]}x${sgn_show(a[0])})`),filter_(`(${b[1]}x${sgn_show(b[0])})`)])
	return to_number(...a)-to_number(...b)//티어별 크기 비교
}
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
		a=Math.floor(Math.random()*(max_value-min_value)+min_value)
		b=non_zero_random()
		if(a%b!=0){
			l[l.length]=[a,b]
		}
	}
	return l
}
module.exports = {
	data: new SlashCommandBuilder()
		.setName('generate_equation')
		.setDescription('방정식을 생성합니다.')
		.addIntegerOption(option=>
			option.setName('차수')
			.setDescription('방정식의 차수를 설정합니다.')
			.setRequired(true))
		.addIntegerOption(option=>
			option.setName('정수해의갯수')
			.setDescription('정수해의 갯수를 설정합니다')
			.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();
		let solution=[...(Array(interaction.options.getInteger('정수해의갯수')).fill(0)).map((e)=>[Math.floor(Math.random()*(max_value-min_value)+min_value),1]),...random_rational(interaction.options.getInteger('차수')-interaction.options.getInteger('정수해의갯수'))]
		console.log(solution)
		solution.sort(comparison)
		const data=eq.generate_equation(solution)
		const result=eq.equation_to_string(data.Expansion)
		const organized=eq.Solutions_to_string(data.Solutions)
		if(result.length>2000){
			await interaction.editReply('길이가 초과되었습니다.')
		}else{
		await interaction.editReply('```c\n'+result+'='+organized+'=0\n```');
		}
	},
};