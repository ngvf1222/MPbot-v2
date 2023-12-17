const { SlashCommandBuilder,EmbedBuilder,MessageAttachment } = require('discord.js');
const { VoiceConnectionStatus, AudioPlayerStatus,joinVoiceChannel,createAudioPlayer,NoSubscriberBehavior,createAudioResource,StreamType } = require('@discordjs/voice');
const voices =require('./voices.json')
const axios = require('axios');
const { Readable } = require('stream');
// const options = {
//   method: 'GET',
//   url: 'https://numbersapi.p.rapidapi.com/random/math'
// };


module.exports = {
	data: new SlashCommandBuilder()
		.setName('수열_재생')
		.setDescription('수열을 틉니다.')
    .addStringOption(option =>
      option.setName('id')
      .setDescription('수열 고유번호(A+6자리 숫자)')
      .setRequired(true))
    .addNumberOption(option=>
        option.setName('bpm')
        .setDescription('BPM (기본값 100)'))
    .addNumberOption(option=>
        option.setName('볼륨')
        .setDescription('볼륨 (기본값 100)'))
    .addNumberOption(option=>
        option.setName('악기')
        .setDescription('악기 (기본값 1)')
        .setAutocomplete(true))
    .addNumberOption(option=>
        option.setName('어택_속도')
        .setDescription('건반 누르는 속도 (기본값 80)'))
    .addNumberOption(option=>
        option.setName('릴리즈_속도')
        .setDescription('건반이 올라오는 속도 (기본값 80)'))
    .addNumberOption(option=>
        option.setName('피치_개수')
        .setDescription('재생할때 사용할 피치의 개수 (기본값 88)'))
    .addNumberOption(option=>
        option.setName('피치_시작_위치')
        .setDescription('피치 시작 위치 (기본값 20)'))
    .addNumberOption(option=>
        option.setName('음표_가짓수')
        .setDescription('재생시 사용할 음표의 가짓수 (기본값 1)'))
    .addNumberOption(option=>
        option.setName('최소_음표')
        .setDescription('재생시 사용할 가장 긴 음표(온음표=1,2분음표=1...) (기본값 0)'))
    .addNumberOption(option=>
        option.setName('수열의_길이')
        .setDescription('전부 재생시 0 (기본값 4096)')),
	async execute(interaction) {
        await interaction.deferReply();
        const id=interaction.options.getString('id')
        const inp_options={
            bpm:interaction.options.getNumber('bpm') ?? 100,
            vol:interaction.options.getNumber('볼륨') ?? 100,
            voice:interaction.options.getNumber('악기') ?? 1,
            velon:interaction.options.getNumber('어택_속도') ?? 80,
            veloff:interaction.options.getNumber('릴리즈_속도') ?? 80,
            pmod:interaction.options.getNumber('피치_개수') ?? 88,
            poff:interaction.options.getNumber('피치_시작_위치') ?? 20,
            dmod:interaction.options.getNumber('음표_가짓수') ?? 1,
            doff:interaction.options.getNumber('최소_음표') ?? 0,
            cutoff:interaction.options.getNumber('수열의_길이') ?? 4096
        }
        const options={
            method:'POST',
            url:`https://oeis.org/play`,
            body:`midi=1&seq=${id}&bpm=${inp_options.bpm}&vol=${inp_options.vol}&voice=${inp_options.voice}&velon=${inp_options.velon}&veloff=${inp_options.veloff}&pmod=${inp_options.pmod}&poff=${inp_options.poff}&dmod=${inp_options.dmod}&doff=${inp_options.doff}&cutoff=${inp_options.cutoff}&PLAY=PLAY`,
            responseType:'arraybuffer'
        }
        let info=await axios.request(options)
        console.log(info.data)
        const channel = interaction.member.voice.channel
        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator
        });
        player.play(createAudioResource(Readable.from(info.data),{
            inputType: StreamType.Arbitrary
        }))
        connection.on('stateChange', (oldState, newState) => {
            console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
        });
        const subscription = connection.subscribe(player);
        connection.on(VoiceConnectionStatus.Disconnected, () => {
            subscription.unsubscribe()
        });
        console.log(connection)
        await interaction.editReply({
            files:[
                {attachment: info.data,
                name:'a.mid'}
            ]
        })
    },
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const choices = voices;
        const filtered = choices.filter(choice => choice.name.includes(focusedValue) || (choice.value+'').includes(focusedValue));
        await interaction.respond(
            filtered.length>25?[...filtered.slice(0,24),{name:`...${filtered.length-24} items`,value:-1}]:filtered
        );
    },
};