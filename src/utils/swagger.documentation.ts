import swaggerJsDoc from 'swagger-jsdoc'
import swaggerUI from 'swagger-ui-express'
import { version } from '../../package.json'
import { Express } from 'express'

const options: swaggerJsDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "AstroBot API Docs",
            version
        },
    },
    apis: ["./src/routes.ts", "./src/controllers/*.ts", "./src/models/*.ts"]
}

const swaggerSpec = swaggerJsDoc(options)

function swaggerDocs(app: Express, port: number) {
    app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec))
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.send(swaggerSpec)
    })
    console.log(`Swagger docs available at http://localhost:${port}/api-docs`)
}



export default swaggerDocs