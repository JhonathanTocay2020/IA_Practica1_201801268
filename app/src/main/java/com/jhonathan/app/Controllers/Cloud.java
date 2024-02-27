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
    public String analyzeImage(@RequestBody Map<String, String> requestBody) {
        try {
            String base64Image = requestBody.get("base64Image");
            // Construir la URL
            String keyV = "AIzaSyD8xG8Q7GkdvEfTGC11WmQIgyLc7qwKGzI";
            String urlString = "https://vision.googleapis.com/v1/images:annotate?key=" + keyV;

            // Crear el cuerpo de la solicitud
            String jsonBody = "{"
                    + "\"requests\":["
                    + "{"
                    + "\"image\":{"
                    + "\"content\":\"" + base64Image + "\""
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

            // Crear la conexión HTTP
            URL url = new URL(urlString);
            HttpURLConnection con = (HttpURLConnection) url.openConnection();

            // Configurar la solicitud HTTP
            con.setRequestMethod("POST");
            con.setRequestProperty("Content-Type", "application/json");
            con.setDoOutput(true);

            // Enviar el cuerpo de la solicitud
            try (OutputStream os = con.getOutputStream()) {
                byte[] input = jsonBody.getBytes("utf-8");
                os.write(input, 0, input.length);
            }

            // Leer la respuesta
            try (BufferedReader br = new BufferedReader(new InputStreamReader(con.getInputStream(), "utf-8"))) {
                StringBuilder response = new StringBuilder();
                String responseLine;
                while ((responseLine = br.readLine()) != null) {
                    response.append(responseLine.trim());
                }

                // Parsear la respuesta JSON
                JsonObject jsonResponse = JsonParser.parseString(response.toString()).getAsJsonObject();
                JsonArray faceAnnotations = jsonResponse.getAsJsonArray("responses")
                        .get(0).getAsJsonObject()
                        .getAsJsonArray("faceAnnotations");

                // Obtener información de los rostros
                int cantidadRostros = faceAnnotations.size();

                // Agregar la cantidad de rostros a la respuesta
                jsonResponse.addProperty("cantidadRostros", cantidadRostros);

                // Devolver la respuesta modificada
                return jsonResponse.toString();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Error al procesar la imagen";
        }
    }
}