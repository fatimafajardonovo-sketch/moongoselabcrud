import mongoose from "mongoose";
import Ticket from "../models/tickets.js";

// Endpoint  endpoint que recibe las peticiones HTTP. req contiene la petición 
// (method, body) y res sirve para devolver la respuesta.
// Este handler recie na petición http, na reqest qe constrye na respesta
export default async function handler(req,res) {
// GET liste los tickets y POST cree uno
    try {
        // readyState === 0 significa desconectado: await espera a qe la conexion termine antes de hacer
        // otra conslta
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI)
        }
        // El metodo http indica qe la operacion crud qe solicitamos
        // CRUD: create, read, pdate and delete
        const {method} = req;
        // get read: consltar con soporte para operadores ($ regex, $exists, filtros)
        if (method == "GET") {
            // req.qery contiene los parasemeos q ke pasamos a la rl
            // por ejemplo, /api/tickets?estado=aierto
            // el filtro empieza vacio, asi qe no llega si no llega ningn parametro, Ticket.find develve todos los tickets
            const {prioridad,estado,scar,sinAsignar} = req.query;
            const filtro = {};
                if (prioridad) filtro.prioridad = prioridad;
                //Sólo se añade si s parametro esta presente
                //Son ejemplos de if de na solo instrccion
                if (estado) filtro.estado = estado;
                if (scar) {
                    // el regrex sca el texto en este caos dentro de titlo, y la opcion i, ignora diferencias entre maysclas y minsclas
                    filtro.titulo = {$regex: scar, $options: "i"}
                }
                if (sinAsignar === "true") {
                    // Los parametros de qery qe llegan, lo hacen como texo. Se compora con tre
                    // exists false selecciona docmentos strings sin ese campo gardado
                    filtro.agenteAsignado = {$exists: false}
                }
                // sort createdat -1 ordena de mas reciente a mas antigo
                // Develve el tanto de total de docmentos comprados
                const tickets = await Ticket.find(filtro).sort({ createdAt: -1 });
                return res.status(200).json({total: tickets.length, datos: tickets});
        }

        // 2. POST: crear un nuevo ticket
        if (method === "POST") {
            // req.body contiene los datos enviados por el cliente
            // create valida y guarda el nuevo documento
            const nuevoTicket = await Ticket.create(req.body);
            return res.status(201).json({
                mensaje: "Ticket nuevo creado con éxito",
                ticket: nuevoTicket,
            });
        }

        // PATCH: actualiza estados, agente o suma horas por código. Actualiza partes, no todo el documento
        if (method === "PATCH") {
            const { codigo } = req.query;
            const { estado, agenteAsignado, sumarHoras, nuevaetiqueta } = req.body;

            // Sin código no se puede saber qué ticket actualizar
            if (!codigo) {
                return res.status(400).json({ error: "Debes indicar el código en la URL ?codigo=BUG-XXX" });
            }

            // Los operadores de actualización expresan qué cambios se hacen sin sustituir el documento entero: $set
            const actualizacion = { $set: {} };

            if (estado) actualizacion.$set.estado = estado;
            if (agenteAsignado) actualizacion.$set.agenteAsignado = agenteAsignado;
            if (sumarHoras) actualizacion.$inc = { horasInvertidas: Number(sumarHoras) };
            if (nuevaetiqueta) actualizacion.$push = { etiquetas: nuevaetiqueta };

            const ticketModificado = await Ticket.findOneAndUpdate(
                { codigo: codigo.toUpperCase() },
                actualizacion,
                { new: true, runValidators: true }
            );

            if (!ticketModificado) {
                return res.status(404).json({ error: "Ticket no encontrado" });
            }

            return res.status(200).json({
                mensaje: "Ticket actualizado con éxito",
                ticket: ticketModificado,
            });
        }
        if (method === "DELETE") {
            const {codigo} = req.query;
            if (!codigo) {
                return res
                .status (400)
                .json({error: "Dees indicar el codigo ?codigo=BUG-XXX en la rl ( el qe qieres orrar)"})
            }
            const eliminado = await Ticket.findOneAndDelete (
            { codigo: codigo.toUpperCase() },
            )
            if (!eliminado) {
                return res.status(404).json({ error: "Ticket no eliminado" });
            }

            return res.status(200).json({
                mensaje: "Ticket eliminado con éxito",
                ticket: eliminado,
            });
        }

        // Si el método no coincide con GET, POST o PATCH, la respuesta no admite esa operación
        res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);
        return res.status(405).json({ error: `Método ${method} no permitido` });

}


    catch (error)  {
        return res.status(500).json({
            error: "Error en la operación CRUD",
            detalle: error.message
        });
    }
}
