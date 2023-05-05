const mult = require("poly-mult-fft")
/** @constant {regexp} */
const equation_rex=/(?<coefficient>[+-]?\d*)(?<isx>x?)\^?(?<degree>\d*)/
//여기에 방정식 관련 기능 통합할 예정
//모든 숫자는 [분자,분모]꼴로 입력
/**
 * @function  generate_equation 
 * @param {number} solutions 방정식들의 해들
 * @returns { {Expansion:number[],Solutions:([number,number])[]}} {Expansion:전개된 방정식, Solutions:해}
 * @requires poly-mult-fft
 */
function generate_equation(solutions){
    return {Expansion:solutions.reduce((p,c)=>mult(p,[-c[0],c[1]]),[1]).map(e=>parseInt(e.toFixed())),Solutions:solutions}
}
/**
 * 함수의 값에 따라 분류
 * @param {array} data 
 * @param {function} condition 
 * @returns {Object} {값:수량,...}
 */
function classification(data,condition){
    result={}
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
 * @param {string} string 
 * @returns {number[]} 계수
 */
function string_to_coefficients(string){
    let coefficients={}
    string.split(/(?=[+-])/)//항 별로 쪼개서
    .map(e=>{
        const groups=e.match(equation_rex).groups
        coefficients[parseInt(groups.degree===''?(groups.isx?'1':'0'):groups.degree)]=parseInt(groups.coefficient===''?'1':groups.coefficient)
    })
    coefficients.length=Math.max(...Array.from(Object.keys(coefficients).map(e=>parseInt(e))))+1
    return Array.from(coefficients,(v)=>v?v:0)
}
/**
 * 다항식 받아서 단순화한 택스트로 변환
 * @param {([number,number])[]} equation 
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
                return e>0?`+${e}x^${i}`:`${e}^${i}`
            }
        }
    })].reverse().join('')
    return result[0]==='+'?result.slice(1,result.length):result//맨앞에+제거
}
/**
 *  해들의 집합을 받아서 그걸 택스트로 바꾸는 함수
 * @param {([number,number])[]} solutions 
 * @returns {string}
 */
function Solutions_to_string(solutions){
    const gcdf = (a, b) => a % b === 0 ? b : gcdf(b, a % b);
    const irreducible=(e)=>{
        const gcd=gcdf(e[0],e[1])
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
    return result.join('').replaceAll('(x)','x')
}
module.exports={
    generate_equation:generate_equation,
    Solutions_to_string:Solutions_to_string,
    string_to_coefficients:string_to_coefficients,
    equation_to_string:equation_to_string,
}
