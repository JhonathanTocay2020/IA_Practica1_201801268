import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import sweetAlert from 'sweetalert2';
//import VisibilityIcon from '@mui/icons-material/Visibility';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
function App() {

  const [previewImage, setPreviewImage] = useState(null);
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [faceDetectionMock, setfaceDetectionMock] = useState(null);
  const [tipoContenido, setTipoContenido] = useState(null);
  // Tipo de Contenido
  const [cantCaras, setCaras] = useState(0);
  const [varAdulto, setAdulto] = useState(0);
  const [varMedical, setMedical] = useState(0);
  const [varRacy, setRacy] = useState(0);
  const [varSpoof, setSpoof] = useState(0);
  const [varViolence, setViolence] = useState(0);
  // difuminado
  const [blurAmount, setBlurAmount] = useState(0);
  // difuminado
  const [mensaje, setMensaje] = useState("");
  const [color, setColor] = useState("white");
  const caluloBlur = ()=>{
    console.log("Adulto: "+ varAdulto);
    console.log(varSpoof);
    console.log(varMedical);
    console.log(varViolence);
    console.log(varRacy);
    
    if (varViolence > 59){
      console.log("filtro por contenido de violencia")
      //setMensaje("filtro por contenido de violencia")
      setBlurAmount(20);
    }

    if (varRacy > 50){
      console.log("filtro por contenido picante")
      //setMensaje("filtro por contenido picante")
      setBlurAmount(20);
    }

    if (varAdulto > 40){
      console.log("filtro por contenido picante")
      //setMensaje("filtro por contenido picante")
      setBlurAmount(20);
    }

    var sumatoria = varViolence + varRacy + varAdulto; 
    if(sumatoria > 45){
      setColor("red");
      setMensaje("Imagen no apta para la institución");
      setBlurAmount(20);
    }else{
      setColor("green");
      setMensaje("Imagen valida");
      setBlurAmount(0);
    }


  }

  const showPanel = (panelNumber) => {
    setSelectedPanel(panelNumber);
    
    setAdulto(calculo(tipoContenido.adult))
    setSpoof(calculo(tipoContenido.spoof))
    setMedical(calculo(tipoContenido.medical))
    setViolence(calculo(tipoContenido.violence))
    setRacy(calculo(tipoContenido.racy))
    caluloBlur(); 
  };

  const [fileInputKey, setFileInputKey] = useState(0);
  const [post, setPost] = useState({
    foto: ""
  });
  
  const calculo = (dat) =>{
    if(dat === "VERY_UNLIKELY"){
      return 0;
    } else if (dat === "UNLIKELY"){
      return 20;
    } else if (dat === "POSSIBLE"){
      return 35;
    } else if (dat === "LIKELY"){
      return 60;
    } else if (dat === "VERY_LIKELY"){
      return 80;
    }
  }

  const convertiraBase64 = (archivos) => {
    setSelectedPanel(0);
    Array.from(archivos).forEach((archivo) => {
      var reader = new FileReader();
      reader.readAsDataURL(archivo);
      reader.onload = function () {
        var aux = [];
        var base64 = reader.result;
        console.log(base64);
        aux = base64.split(',');
        //console.log(aux[1]);
        //console.log(typeof aux[1]);
        setPost({...post, foto: aux[1]}) // Guardamos el dato en UseState para posteriormente enviarlo.
        setPreviewImage(base64); // Guardar la imagen base64 en el estado para previsualización
      };
    });
  };
  
  const AnalizarImagen = () =>{
    let body = {
      base64Image: post.foto
    }
    
    /*try {
      const response = axios.get('http://localhost:8080/log');
      // Aquí puedes manejar la respuesta según tus necesidades
      console.log('Respuesta del servidor:', response.data);
    } catch (error) {
      // Aquí puedes manejar errores en la solicitud
      console.error('Error al hacer la solicitud:', error);
    }*/
    axios.post('http://localhost:8080/Analizar', body).then(response =>{
       //console.log(response.data)
       //onsole.log(response.data.responses[0])
       setfaceDetectionMock(response.data.responses[0])
       console.log(response.data.responses[0].safeSearchAnnotation)
       setTipoContenido(response.data.responses[0].safeSearchAnnotation)
       setCaras(response.data.cantidadRostros)
       //console.log(response.data.cantidadRostros)
       sweetAlert.fire({
        title: "Correcto",
        text: "Analisis Completo",
        icon: "success"
      });
    }).catch(error =>{
        console.log(error.message);
    })   
    //console.log(body)
  };

  return (
    <div className="App">
       <div className="container mt-4">
       <div className="mb-3 d-flex align-items-center">
        <input
          type="file"
          id="foto"
          name="foto"
          className="form-control mr-2"
          onChange={(e) => convertiraBase64(e.target.files)}
        />
      
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{paddingLeft: '10px', paddingRight: '10px' }}
          onClick={() =>  AnalizarImagen()}
        >
          Analizar 
        </button>
      </div>
       </div>
      <div>        
        <br></br>
        {/* Mostrar la previsualización de la imagen  Si no hay no muestra d*/}
        {previewImage && (
          <img
            src={previewImage}
            alt="Preview"
            style={{ maxWidth: '100%', maxHeight: '200px' }}
          />
        )}

<Container className="mt-4">
      <Row>
        <Col>
          <Button className="mt-3" onClick={() => showPanel(1)}>
            Caras
          </Button>

          <Button className="mt-3" onClick={() => showPanel(2)}>
            Tipo Contenido
          </Button>
        </Col>
        </Row>
        <Row>
        <Col>
          {selectedPanel === 1 && (
            <Card>
  <Card.Body>
  <p>Cantidad de Caras Detectadas: {cantCaras}</p>
    {previewImage && (
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start' }}>
        <img
          src={previewImage}
          alt="Preview"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
        {faceDetectionMock &&
          faceDetectionMock.faceAnnotations &&
          faceDetectionMock.faceAnnotations.map((face, index) => {
            if (face.boundingPoly && face.boundingPoly.vertices) {
              //const { x, y } ;
              const imageWidth = faceDetectionMock.faceImageWidth || 1; // Default a 1 para evitar divisiones por 0
              const imageHeight = faceDetectionMock.faceImageHeight || 1; // Default a 1 para evitar divisiones por 0
              const x = (face.boundingPoly.vertices[0].x / imageWidth);
              const y = (face.boundingPoly.vertices[0].y / imageHeight);
              const width = ((face.boundingPoly.vertices[2].x - face.boundingPoly.vertices[0].x) / imageWidth);
              const height = ((face.boundingPoly.vertices[2].y - face.boundingPoly.vertices[0].y) / imageHeight);
              //const x = face.boundingPoly.vertices[0].x;
              //const y = face.boundingPoly.vertices[0].y;
              //const width = face.boundingPoly.vertices[2].x - x;
              //const height = face.boundingPoly.vertices[2].y - y;

              console.log('Calculated X:', x);
            console.log('Calculated Y:', y);
            console.log('Calculated Width:', width);
            console.log('Calculated Height:', height);
              return (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    border: '2px solid red',
                    boxSizing: 'border-box',
                    left: x,
                    top: y,
                    width: width,
                    height: height,
                  }}
                />
              );
            } else {
              console.error('Face data missing or invalid:', face);
              return null; // Omitir el renderizado si falta información de la cara
            }
          })}
      </div>
    )}
  </Card.Body>
</Card>

          )}

          {selectedPanel === 2 && (
            <Card className="mt-3">
              <Card.Body>
                <h3>Tipo de Contenido</h3>
                <Container>
                  <Row>
                    <Col>
                      <p>Imagen</p>
                      {previewImage && (
                        <img
                          src={previewImage}
                          alt="Preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '600px',
                            filter: `blur(${blurAmount}px)`
                          }}
                        />
                      )}
                    </Col>
                    <Col>
                      <p>Analisis</p>
                      <p>Adulto: {tipoContenido.adult}</p>
                      <ProgressBar variant="success" now={varAdulto === 0 ? varAdulto+10:varAdulto} label={`${varAdulto}%`} />
                      <p>Parodia: {tipoContenido.spoof}</p>
                      <ProgressBar variant="success" now={varSpoof === 0 ? varSpoof+10:varSpoof} label={`${varSpoof}%`} />
                      <p>Medical: {tipoContenido.medical}</p>
                      <ProgressBar variant="success" now={varMedical === 0 ? varMedical+10:varMedical} label={`${varMedical}%`} />
                      <p>Violencia: {tipoContenido.violence}</p>
                      <ProgressBar variant="success" now={varViolence === 0 ? varViolence+10 :varViolence} label={`${varViolence}%`} />
                      <p>Picante: {tipoContenido.racy}</p>
                      <ProgressBar variant="success" now={varRacy === 0 ? varRacy + 10 : varRacy} label={`${varRacy}%`} />
                      <br></br>
                      <p style={{ color: `${color}` }}>{mensaje}</p>
                      
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{paddingLeft: '10px', paddingRight: '10px' }}
                      >ver</button>
                    </Col>
                  </Row>
                </Container>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
      </div>
    </div>
  );
}

export default App;
