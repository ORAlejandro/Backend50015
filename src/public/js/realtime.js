const socket = io();
const role = document.getElementById("role").textContent;
const email = document.getElementById("email").textContent;

socket.on("productos", (data) => {
    renderProductos(data);
})

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
        card.querySelector("button").addEventListener("click", () => {
            if (role === "premium" && item.owner === email) {
                eliminarProducto(item._id);
            } else if (role === "admin") {
                eliminarProducto(item._id);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Acceso Denegado",
                    text: "No es posible eliminar un producto que no te pertenece",
                })
            }
        });
    })
}

const eliminarProducto = (id) =>  {
    socket.emit("eliminarProducto", id);
}

document.getElementById("btnEnviar").addEventListener("click", () => {
    agregarProducto();
})

const agregarProducto = () => {
    //Guardo en variables el role y el email
    const role = document.getElementById("role").textContent;
    const email = document.getElementById("email").textContent;
    //Declaro si owner es premium o admin
    const owner = role === "premium" ? email : "admin";
    const producto = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        price: document.getElementById("price").value,
        img: document.getElementById("img").value,
        code: document.getElementById("code").value,
        stock: document.getElementById("stock").value,
        category: document.getElementById("category").value,
        status: document.getElementById("status").value === "true",
        owner
    };

    socket.emit("agregarProducto", producto);
}