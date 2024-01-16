const { SlashCommandBuilder,EmbedBuilder } = require('discord.js');
// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { firebaseConfig }=require("../../config.json")
const { getFirestore, where } =require("firebase/firestore")
const { collection, getDocs, doc,query, orderBy,limit } =require("firebase/firestore"); 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration



// Initialize Firebase
initializeApp(firebaseConfig);
const db=getFirestore()
const scoresRef=collection(db,'score')
module.exports = {
	data: new SlashCommandBuilder()
		.setName('랭킹')
		.setDescription('랭킹을 보여줍니다')
        .addIntegerOption(option=>
            option.setName('범위')
            .setDescription('검색 범위')
            .addChoices(
                {name:'전체',value:0},
                {name:'서버',value:1}
            )
            .setRequired(true))
		.addIntegerOption(option=>
			option.setName('차수')
			.setDescription('방정식의 차수')
			.setMinValue(1)
			.setRequired(true)),
	async execute(interaction) {
        let data;
        // const a=`'scores.${interaction.options.getInteger('차수')}'`
        console.log('a')
        data=await getDocs(await query(scoresRef))//await getDocs(await query(scoresRef,orderBy(a,'desc')))//await scoresRef.orderBy(`score.${interaction.options.getInteger('차수')}`,'desc').limit(10).get()
        console.log('b')
        data=Array.from(data.docs.map(e=>e.data()))
        console.log(data)
        if(interaction.options.getInteger('범위')===1){
            const users=await interaction.guild.members.fetch()
            const users_ID=users.map(e=>e.id)
            console.log(data,users_ID)
            data=data.filter(e=>users_ID.includes(e.id))
            console.log(data)
        }
        qm=(e)=>e?e:interaction.options.getInteger('차수')*61+1
        data=data.toSorted((b,a)=>qm(b[`scores.${interaction.options.getInteger('차수')}`])-qm(a[`scores.${interaction.options.getInteger('차수')}`]))
        const text=data.slice(0,10).map((e,i)=>e[`scores.${interaction.options.getInteger('차수')}`]!==undefined?`${i+1}. ${interaction.options.getInteger('범위')===1?`<@${e.id}>`:e.name}:  ${e[`scores.${interaction.options.getInteger('차수')}`]}초`:``).join('\n')
        await interaction.reply(text?text:'아무도 없군요...')
	},
};