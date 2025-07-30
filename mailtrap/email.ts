import {client , sender} from "./mailtrap"


export const sendVerificationEmail = async (email: string , verificationToken:string)=>{
    const recipient = [  { email } ];
    try {
        const res = await client.send({
            from: sender ,
            to: recipient ,
            subject: "Verify your email" ,
            category: "Email verification"
        })
    } catch (error) {
        console.log(error)
    }
}


export const sendWelcomeEmail = async (email: string , name : string)=>{
    const recipient = [  { email } ];
    const htmlContent = ""
    try {
        const res = await client.send({
            from: sender ,
            to: recipient ,
            html: htmlContent ,
            subject: "Welcome to MealMart",
            template_variables:{
                company_info_name: "MealMart" ,
                name : name
            }
        })
    } catch (error) {
        console.log(error)
    }
}

 
export const sendPasswordResetEmail = async (email: string ,resetURL: string)=>{
    const recipient = [  { email } ]; 
      const htmlContent = ""
    try {
        const res = await client.send({
            from: sender ,
            to: recipient ,
            html: htmlContent ,
            subject: "Verify your email" ,
            category: "Reset password"
        })
    } catch (error) {
        console.log(error)
    }
}


export const sendResetSuccessEmail = async (email: string ,resetURL: string)=>{
    const recipient = [  { email } ]; 
      const htmlContent = ""
    try {
        const res = await client.send({
            from: sender ,
            to: recipient ,
            html: htmlContent ,
            subject: "Password reset successfully" ,
            category: "Reset password"
        })
    } catch (error) {
        console.log(error)
    }
}