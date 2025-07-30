import cookieParser from "cookie-parser"
import express from "express"
import cors from "cors"
const app = express()


app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors({
    origin: "http://localhost:5173" ,
    credentials: true
}))


app.get("/" , (req , res)=>{
    res.status(200).json({
        message :  "server is running",
        success: true
    })
})


const PORT = process.env.PORT! || 7001

const runServer = async ()=>{
    try {
        app.listen(PORT , ()=>{
            console.log(`server is runnig at http://localhost:${PORT}`)
        })
    } catch (error) {
        console.log(Error)
    }
}
runServer()