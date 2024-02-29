package com.jhonathan.app.Controllers;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class Cloud {

    @GetMapping("/log")
    public String getLog() {
        return "Hola";
    }

    @PostMapping("/Analizar")
    public String analizarIMG(@RequestBody Map<String, String> requestBody) {
        try {
            String img = requestBody.get("base64Image");
            // Url + Clave de API's
            String ClaveGCP = "AIzaSyD8xG8Q7GkdvEfTGC11WmQIgyLc7qwKGzI";
            String urlString = "https://vision.googleapis.com/v1/images:annotate?key=" + ClaveGCP;

            // Crear el cuerpo de la Peticion hacia Vision AI
            String cuerpoJSON = "{"
                    + "\"requests\":["
                    + "{"
                    + "\"image\":{"
                    + "\"content\":\"" + img + "\""
                    + "},"
                    + "\"features\":["
                    + "{"
                    + "\"type\":\"FACE_DETECTION\""
                    + "},"
                    + "{"
                    + "\"type\":\"SAFE_SEARCH_DETECTION\""
                    + "}"
                    + "]"
                    + "}"
                    + "]"
                    + "}";

            // Crear una conexión HTTP
            URL url = new URL(urlString); // Obtenemos la ruta completa y lo convertimos a tipo URL 
            HttpURLConnection con = (HttpURLConnection) url.openConnection();  
            // Configurar la solicitud HTTP
            con.setRequestMethod("POST");  // tipo de Peticion
            con.setRequestProperty("Content-Type", "application/json"); // Propiedades de la Petición
            con.setDoOutput(true);

            // Enviar el cuerpo de la solicitud
            try (OutputStream os = con.getOutputStream()) {
                byte[] input = cuerpoJSON.getBytes("utf-8"); // usamos utf-8 
                os.write(input, 0, input.length);
            }

            // Leer la respuesta
            try (BufferedReader bufferRead = new BufferedReader(new InputStreamReader(con.getInputStream(), "utf-8"))) {
                StringBuilder respuesta = new StringBuilder();
                String linea;
                while ((linea = bufferRead.readLine()) != null) {
                    respuesta.append(linea.trim());
                }

                // Parsear la respuesta a formato JSON
                JsonObject Respuesta = JsonParser.parseString(respuesta.toString()).getAsJsonObject();
                // en la variable cara obtenemos el atributo en faceAnnotations
                JsonArray caras = Respuesta.getAsJsonArray("responses").get(0).getAsJsonObject().getAsJsonArray("faceAnnotations");
                int cantidadRostros = caras.size(); // Obtenemos el tamaño la lista de json de face Annotations
                Respuesta.addProperty("cantidadRostros", cantidadRostros);// Agregar la cantidad de rostros a la respuesta JSON
                return Respuesta.toString(); // Devolver la respuesta modificada
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Error al procesar la imagen";
        }
    }
}