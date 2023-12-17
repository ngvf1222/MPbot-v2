/**
 * @author ngvf
 * @version 1.0.0
 * @file 방정식 관련 함수들 모음
 * @license MIT
 */
const mult = require("poly-mult-fft")
/** @constant {regexp} */
const equation_rex=/(?<coefficient>[+-]?\d*)(?<isx>x?)\^?(?<degree>\d*)/
//여기에 방정식 관련 기능 통합할 예정
//모든 숫자는 [분자,분모]꼴로 입력
/**
 * 방정식의 해 가지고 방정식 만들어주는 함수
 * @function  generate_equation 
 * @param {([number,number])[]} solutions 방정식들의 해들
 * @returns { {Expansion:number[],Solutions:([number,number])[]} } {Expansion:전개된 방정식, Solutions:해}
 * @requires poly-mult-fft
 */
function generate_equation(solutions){
    return {
        Expansion:solutions.reduce((p,c)=>mult(p,[-c[0],c[1]]),[1]).map(e=>parseInt(e.toFixed())),
        Solutions:solutions
    }
}
/**
 * 함수의 값에 따라 분류
 * @function classification
 * @param {array} data 
 * @param {function} condition 
 * @returns {Object} {값:수량,...}
 */
function classification(data,condition){
    let result={}
    data.forEach(e => {
        if(Object.keys(result).includes(condition(e).join(','))){
            result[condition(e)]+=1
        }else{
            result[condition(e)]=1
        }
    });
    return result
}
/**
 * 문자열로 표기된 방정식을 계수로 다룰수있게 변환
 * @function string_to_coefficients
 * @param {string} string 
 * @returns {number[]} 계수
 */
function string_to_coefficients(string){
    let coefficients={}
    string.split(/(?=[+-])/)//항 별로 쪼개서
    .map(e=>{
        const groups=e.match(equation_rex).groups
        coefficients[parseInt(groups.degree===''?(groups.isx?'1':'0'):groups.degree)]=parseInt(
            groups.coefficient===''?'1':groups.coefficient
            )
    })
    coefficients.length=Math.max(...Array.from(
        Object.keys(coefficients)
        .map(e=>parseInt(e)))
        )+1
    return Array.from(coefficients,(v)=>v?v:0)
}
/**
 * 다항식 받아서 단순화한 택스트로 변환
 * @function equation_to_string
 * @param {number[]} equation 
 * @returns {string} 단순화한 택스트
 */
function equation_to_string(equation){
    const result=[...equation.map((e,i)=>{
        if(e===0){
            return ''
        }else if(e===1){
            if(i===0){
                return '+1'
            }else if(i===1){
                return '+x'
            }else{
                return `+x^${i}`
            }
        }else if(e===-1){
            if(i===0){
                return '-1'
            }else if(i===1){
                return '-x'
            }else{
                return `-x^${i}`
            }
        }else{
            if(i===0){
                return e>0?`+${e}`:`${e}`
            }else if(i===1){
                return e>0?`+${e}x`:`${e}x`
            }else{
                return e>0?`+${e}x^${i}`:`${e}x^${i}`
            }
        }
    })].reverse().join('')
    //console.log(result)
    return result[0]==='+'?result.slice(1,result.length):result//맨앞에+제거
}
/**
 *  해들의 집합을 받아서 그걸 택스트로 바꾸는 함수
 * @function Solutions_to_string
 * @param {([number,number])[]} solutions 
 * @returns {string}
 */
function Solutions_to_string(solutions){
    let k=1
    const irreducible=(e)=>{
        console.log('a',e)
        const gcdf = (a, b) => a % b === 0 ? b : gcdf(b, a % b);
        const gcd=gcdf(e[0],e[1])
        k*=gcd
        console.log(gcd,k)
        return [e[0]/gcd,e[1]/gcd]
    }
    let classifica=classification(solutions,irreducible)
    const result=Object.keys(classifica).map(e=>{
        const degree=classifica[e]
        const coefficient=e.split(',')
        console.log(e,equation_to_string([-parseInt(coefficient[0]),parseInt(coefficient[1])]))
        if(degree===1){
            return `(${equation_to_string([-parseInt(coefficient[0]),parseInt(coefficient[1])])})`
        }else{
            return `(${equation_to_string([-parseInt(coefficient[0]),parseInt(coefficient[1])])})^${degree}`
        }
    })
    return (k==1?'':parseInt(k**0.5)+'')+result.join('').replaceAll('(x)','x')
}
/**
 * equation을 (x-r)로 나누는 조립제법 함수
 * @param {int} r (x-r)
 * @param {int[]} equation 식
 * @returns {{result:int[],remainder:int,information:[int[],int[],int[],r]}}
 */
function Synthetic_division(r,equation)
    {
        line1=[...equation].reverse()
        line2=[]
        line3=[line1[0]]
        for(let i=0;i<line1.length-1;i++){
            line2[i]=r*line3[i]
            line3[i+1]=line1[i+1]+line2[i]
        }
        line3.reverse()
        return {result:line3.slice(1,line3.length),remainder:line3[0],information:[line1,line2,[...line3].reverse(),r]}
    }
/**
 * 조립제법을 시각화
 * @function Synthetic_division_to_string
 * @param {int[]} line1 조립제법 1번째줄
 * @param {int[]} line2 조립제법 2번째줄
 * @param {int[]} line3 조립제법 3번째줄
 * @param {int} r R
 * @returns {string} 조립제법을 시각화한 택스트
 */
function Synthetic_division_to_string(line1,line2,line3,r){
    const maxlen=Math.max(...line1.map(e=>(e+'').length),
                          ...line2.map(e=>(e+'').length),
                          ...line3.map(e=>(e+'').length))
    
    let line1_string=`${r} │ ${line1[0]}`
    line1.slice(1,line1.length).forEach(e=>{
        const str=e+""
        line1_string+='  '+' '.repeat(maxlen-str.length)+str
    })

    line2_string=' '.repeat((r+"").length)+' │ '+' '.repeat((line1[0]+"").length)
    line2.forEach(e=>{
        const str=e+""
        line2_string+='  '+' '.repeat(maxlen-str.length)+str
    })

    line3_string=' '.repeat((r+"").length)+' └─'+'─'.repeat((line1[0]+"").length+(2+maxlen)*(line1.length-2)+2)+'┬'+'─'.repeat(maxlen)

    line4_string=' '.repeat((r+"").length)+'   '+(line3[0]+"")
    line3.slice(1,line3.length-1).forEach(e=>{
        const str=e+""
        line4_string+='  '+' '.repeat(maxlen-str.length)+str
    })
    line4_string+='  │'+' '.repeat(maxlen-1-(line3[line3.length-1]+"").length)+line3[line3.length-1]

    return [line1_string,
        line2_string,
        line3_string,
        line4_string].join('\n')
}
module.exports={
    generate_equation:generate_equation,
    Solutions_to_string:Solutions_to_string,
    string_to_coefficients:string_to_coefficients,
    equation_to_string:equation_to_string,
    Synthetic_division:Synthetic_division,
    Synthetic_division_to_string:Synthetic_division_to_string,
}
