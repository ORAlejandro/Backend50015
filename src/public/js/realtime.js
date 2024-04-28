const socket = io(); 

socket.on("productos", (data) => {
    //console.log(data);
    renderProductos(data);
})

//Función para renderizar nuestros productos: 

const renderProductos = (productos) => {
    const contenedorProductos = document.getElementById("contenedorProductos");
    contenedorProductos.innerHTML = "";
    
    productos.docs.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("realMainCard");

        card.innerHTML = ` 
                        <div class="realCards">
                            <p>Producto: ${item.title}</p>
                            <p>Precio: $${item.price}</p>
                            <button class="cartsBtnEliminar">Eliminar</button>
                        </div>
                        `;

        contenedorProductos.appendChild(card);
        //Agregamos el evento al boton de eliminar: 
        card.querySelector("button").addEventListener("click", ()=> {
            eliminarProducto(item._id);
        })
    })
}


const eliminarProducto = (id) =>  {
    socket.emit("eliminarProducto", id);
}

//Agregamos productos del formulario: 

document.getElementById("btnEnviar").addEventListener("click", () => {
    agregarProducto();
})


const agregarProducto = () => {
    const producto = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        price: document.getElementById("price").value,
        img: document.getElementById("img").value,
        code: document.getElementById("code").value,
        stock: document.getElementById("stock").value,
        category: document.getElementById("category").value,
        status: document.getElementById("status").value === "true",
    };

    socket.emit("agregarProducto", producto);
}
