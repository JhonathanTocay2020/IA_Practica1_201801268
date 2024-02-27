package com.jhonathan.app.Controllers;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@CrossOrigin(origins = "*")
public class Hola {
    @GetMapping("/")
    String saludo(){
        return "Hola Mundo";
    }        
}
