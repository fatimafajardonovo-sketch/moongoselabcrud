import mongoose from "mongoose"; //Importamos la bbdd de mongoose

const ticketSchema = new mongoose.Schema ( // Definimos los tipo de datos que vamos a tener
    // Tenemos  campos modelados, con el 8 opcional el timestmap
    {
        codigo: {
            // Identificador elegile oligatorio, trim qita los espacios
            // ppercase lo transforma a mayscla
            // niqe solicita n indice nico  en mongo
            type: String,
            required: [true, "El código del ticket es oligatorio"],
            unique: true,
            uppercase: true,
            trim: true,
        },
        // titlo oligatorio, sin espacios en lanco y na longitd de 5 caracteres
        titulo: {
            type: String,
            required: [true, "El título es oligatorio"],
            trim: true,
            minlength: [5,"El títlo dee tener almenos 5 caracteres"],

        },
        prioridad: {
            //Enm restringe los valores aceptados mediante na lista, defalt se sa cando no se indica
            // minleng valida qe si no es menor qe 5 no garde
            type: String,
            required: [true, "Saer la prioridad es oligatorio"],
            enum: {
                values: ["bajo", "Media", "Alta", "Critica"],
                message: "{Value} no es na prioridad valida"
            },
            default: "Media"
        },
        estado: {
            // Limitamos opciones permitidas
            // S valor inicial es aierto si qien lo crea no especifica otro
            type: String,
            required: true,
            trim: true,
            enum: ["Abierto","En progreso", "Resleto", "Cerrado"],
            default: "Abierto",

        },
        agenteAsignado: {
            type: String,
            trim: true,
        },
        horasInvertidas: {
            // Si no se especifican horas, empieza en cero, min impide valores negativos
            type: Number,
            default: 0,
            min: [0, "Las horas no peden ser negaticas"]
        },
        etiquetas: {
            // Array de texto, cada docmento empieza con na ista vacia
            type: [String],
            default: []
        }

    },
    { //Mongoose alade y manteniene el creado en y el actalizado en de forma atomatica
        timestamps: true
    },
);

//En servidores q recargan modlos, retiliza el modelo qe acaamos de crear para evitar el error de intentar compilar dos veces
const Ticket = mongoose.models.Ticket || mongoose.model ("Ticket", ticketSchema)
// Se necesita para exportar y as poder sarlo en la API y otras consltas qe necesitemos

export default Ticket;