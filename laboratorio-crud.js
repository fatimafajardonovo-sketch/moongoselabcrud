import mongoose from "mongoose"; //Importamos la bbdd de mongoose
import dotenv from "dotenv"; // dotenv carga las variales de entornos desde el archivo dotenv
import Ticket from "./models/tickets.js"; //importamos el modelo definido en tickets.js, qe se llama Tickets

dotenv.config(); 

async function ejectarCicloCrud() {
    try {
        // Mongod ri se lee desde el archico del entorno .env
        await mongoose.connect(process.env.MONGODB_URI);
        console.log ("Conectado a mongoDB Atlas");
        //vaciamos la coleccion antes de insertar los ejemplos, asi cada na empieza con los mismos datos
        //Cando hacemos n filtro vacio ({}) selecciona todo. Esto en concreto qita los tickets de na colleccion
        // Es til para na practica controlada
        await Ticket.deleteMany({});
        // 1. Create, crea docmentos
        console.log("---1. Fase Create: Inserta los tickets iniciales")
        // Insertamos varios docmentos en na sola operacion y develve los docmentos creados qe
        // aqi se san para informar cando se crearon
        const ticketsCreados = await Ticket.insertMany([
            {
                codigo: "bug-101",
                titulo: "Pasarela de pago con g",
                prioridad: "Alta",
                etiquetas: ["pagos", "ackend", "prodccion"]
            },
            {
                codigo: "bug-102",
                titulo: "No fnciona el oton de login",
                prioridad: "bajo",
                agenteAsignado: "Sofia Castro",
                etiquetas: ["css", "movil", "botones"],
                estado: "En progreso",
                horasInvertidas: 20,
            },
            {
                codigo: "INC001",
                titulo: "Error al iniciar sesión",
                prioridad: "Alta",
                estado: "En progreso",
                agenteAsignado: "Carlos",
                horasInvertidas: 2.5,
                etiquetas: ["login", "usuarios", "error"]
            },
        ]);
        console.log(`Se crearon ${ticketsCreados.length} tickets\n`);

        // 2. Read; consltas con operadores
        console.log ("---2. Fase Read: Consltas con operadores");
        // develce docmentos qe cmplan al menos na de las condiciones; prioridad critica de mas de catro
        // .select limita los campos de la respesta
        // el signo delante de _id exclye ese campo
        // Los resltados se gardan en na variale qe podemos inspeccionar despés
        // find decelve na lista inclso cando hay na sola coincidencia.
        
        /*
        const ajaoconpocashoras = await Ticket.find ({
            $or: [{ prioridad:"aja"}, {horasInvertidas: {$lte: 2}}],
        }).select("codigo titulo prioridad horasInvertidas -_id");
        console.log ("Total de resltados B:", ajaoconpocashoras.length);
        */


        const rgentesocomplejos = await Ticket.find ({
            $or: [{ prioridad:"Critica"}, {horasInvertidas: {$gt: 4}}],
        }).select("codigo titulo prioridad horasInvertidas -_id");
        console.log (" A)Criticos ó con > de 4 horas ($or):",rgentesocomplejos);

        // Exists false saca docmentos donde la prioridad no existe
        // No eqivale necesariamente a scar na prioridad gardada con clear
        const sinAgente = await Ticket.find (
            {
                agenteAsignado: {$exists: false},
            }
        ).select ("codigo titlo prioridad horasInvertidas -_id");
        console.log ("Tickets sin agente asignado {$exists: false}:", sinAgente);

        
        /*
        const sinAgente = await Ticket.find (
            {
                agenteAsignado: {$exists: false},
            }
        ).select ("codigo titlo prioridad horasInvertidas -_id");
        console.log ("Tickets sin agente asignado {$exists: false}:", sinAgente);

        */
       // All exige qe la etiqeta contenga el valor movil
       const movilProd = await Ticket.find ({
        etiquetas: {$all: ["movil"]}
       }).select ("codigo etiqetas -_id");
       console.log("\n Tickets con tags movil ($all)", movilProd);

       
        const ticketsPorTitlo = await Ticket.find ({
         titulo: {$regex: "Pasarela", $options: "i"}
        }).select ("codigo etiquetas -_id");
       console.log("\n Tickets cyo titlo contine 'pasarela' ($regex):", ticketsPorTitlo);

    // 3. UPDATE ACTALIZACION INDIVIDAL, ATOMICA Y MASIVA
    // Localiza el ticket y lo modificamos en na sola opcion: findOneAndpdate
    // $set reemplaza valores concretos
    // $inc incrementa o sma al nmero existente
    // $psh develve el elemento al array
        const ticketActalizado = await Ticket.findOneAndUpdate (
            { codigo: "bug-101"},
            {
                $set:{agenteAsignado: "Bruno", estado: "En progreso"},
                $inc: {horasInvertidas: 3}, // se sma a las qe existe
                $push: {etiquetas: "parche-rgente"}
            },
            {// Develve el nuevo y ejecta validadores del Schema SIEMPRE HAY QE HACERLO
                returnDocument: "after",
                runValidators: true
            });
            console.log ( "A) bug-101 actalizado:" ,
                {
                    codigo: ticketActalizado.codigo,
                    agente: ticketActalizado.agenteAsignado,
                    estado: ticketActalizado.estado,
                    horas: ticketActalizado.horasInvertidas,
                    etiquetas: ticketActalizado.etiquetas
                }
            );
    }
    catch (error){
        // Si algna operacion falla en el try se salta hacia aqi, el error se informa
        console.error ("Error en el lab:", error.message)
    }
    finally{
        await mongoose.disconnect ();
        console.log ("Desconectado de Mongo Atlas");
    }
};
ejectarCicloCrud();