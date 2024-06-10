'use client';
import validate from "@/helpers/validate";
import { useEffect, useState } from "react";
import IVehicleData from "../../../../interfaces/IVehicleData";
import IErrorsVehicleForm from "../../../../interfaces/IErrorsVehicleForm";
import axios from 'axios';
import { useRouter, useParams } from "next/navigation";

const UploadPost = () => {
    const { id } = useParams(); // Obtener el ID del vehículo desde la URL
    const router = useRouter();
    const apiUrl = `${process.env.NEXT_PUBLIC_API_POSTS}/${id}`; // URL de la API con el ID del vehículo
    if (!apiUrl) {
      throw new Error('Environment variable NEXT_PUBLIC_API_POSTS is not set');
    }

    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>(null);
    const [userSession, setUserSession] = useState<string | null>(null);
    const [errors, setErrors] = useState<IErrorsVehicleForm>({});
    const [vehicleData, setVehicleData] = useState<IVehicleData>({
        title: '',
        description: '',
        price: 0,
        color: '',
        model: '',
        file: null,
        brand: '',
        year: 0,
        mileage: '',
    });

    useEffect(() => {
        if (typeof window !== "undefined" && window.localStorage) {
            const userToken = localStorage.getItem('userSession');
            setToken(userToken);
            !userToken && router.push("/login");
        }
    }, []);

    // Cargar los datos del vehículo
    useEffect(() => {
        const fetchVehicleData = async () => {
            try {
                const response = await axios.get(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setVehicleData(response.data);

                // Verificar si el usuario logueado es el propietario
                if (response.data.ownerId === userSession) {
                    setIsOwner(true);
                }

            } catch (error) {
                console.error('Error al cargar los datos del vehículo:', error);
            }
        };

        if (token && userSession) {
            fetchVehicleData();
        }
    }, [apiUrl, token, userSession]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, files } = e.target as HTMLInputElement;

        if (name === "file") {
            setVehicleData(prevData => ({
                ...prevData,
                [name]: files
            }));
        } else {
            setVehicleData(prevData => ({
                ...prevData,
                [name]: value
            }));
        }

        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: value.trim() === '' ? 'Este campo es requerido' : ''
        }));
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = event.target;

        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: value.trim() === '' ? 'Este campo es requerido' : ''
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        // Validar los datos del vehículo
        const validationErrors = validate(vehicleData);
        setErrors(validationErrors);
    
        // Si no hay errores de validación, proceder con el envío
        if (Object.keys(validationErrors).length === 0) {
            const formData = new FormData();
            formData.append("title", vehicleData.title);
            formData.append("description", vehicleData.description);
            formData.append("price", vehicleData.price.toString());
            formData.append("color", vehicleData.color);
            formData.append("model", vehicleData.model);
            formData.append("brand", vehicleData.brand);
            formData.append("year", vehicleData.year.toString());
            formData.append("mileage", vehicleData.mileage);
    
            // Si hay archivos, adjuntarlos al formData
            if (vehicleData.file) {
                Array.from(vehicleData.file).forEach(file => {
                    formData.append("file", file);
                });
            }
    
            try {
                // Enviar los datos al servidor
                const response = await axios.put(apiUrl, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
    
                console.log('Respuesta del servidor:', response);
                if (response.data && response.data.success) {
                    alert('El vehículo se ha actualizado correctamente');
                    router.push("/");
                } else {
                    const errorMessage = response.data?.message || 'Respuesta del servidor no válida.';
                    alert(errorMessage);
                }
            } catch (error) {
                console.error('Error al actualizar el vehículo:', error);
                alert('Hubo un error al intentar actualizar el vehículo.');
            }
        }
    };
// Si el usuario no es el propietario, mostrar un mensaje de error o redirigir
        // if (!isOwner) {
        //     return <div>No tienes permiso para editar esta publicación.</div>;
        // }
    

    return (
        <div className="bg-gradient-to-bl from-[#222222] to-[#313139] font-sans text-white">
            <div className="flex flex-col gap-2 p-4 items-center">
                <h1 className="text-4xl font-semibold mt-6">¡Edita tu vehículo!</h1>
                <span className="text-xl">Ajusta los detalles necesarios.</span>
            </div>

            <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-8 flex-wrap bg-[#222222] rounded">
                <div className="block mb-4">
                    <label className=" text-slate-50">Título</label>
                    <input
                        name="title"
                        type="text"
                        value={vehicleData.title}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        className="w-full px-3 mt-3 py-2 border rounded text-[#222222]"
                    />
                    {errors.title && <span className="text-red-500">{errors.title}</span>}
                </div>
                <div className="block mb-4">
                    <label className=" text-slate-50">Descripción</label>
                    <textarea
                        name='description'
                        value={vehicleData.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        className="w-full px-3 mt-3 py-2 border rounded text-[#222222]"
                    />
                    {errors.description && <span className="text-red-500">{errors.description}</span>}
                </div>
                <div className="flex gap-8">
                    <div className="mb-4">
                        <label className="text-slate-50">Valor</label>
                        <input
                            name='price'
                            type="number"
                            value={vehicleData.price}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            className="w-full px-3 mt-3 py-2 border rounded text-[#222222]"
                        />
                        {errors.price && <span className="text-red-500">{errors.price}</span>}
                    </div>
                    <div className="mb-4 w-1/2">
                        <label className="text-slate-50">Selecciona la marca</label>
                        <select
                            name='brand'
                            value={vehicleData.brand}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            className="w-full px-3 mt-3 py-2 border rounded text-[#222222]"
                        >
                            <option value="" disabled>Selecciona la marca...</option>
                            <option value="Kia">Kia</option>
                            <option value="Chevrolet">Chevrolet</option>
                            <option value="Mazda">Mazda</option>
                            <option value="Ford">Ford</option>
                            <option value="Ferrari">Ferrari</option>
                        </select>
                        {errors.brand && <span className="text-red-500">{errors.brand}</span>}
                    </div>
                </div>
                <div className="flex gap-8">
                    <div className="mb-4 w-1/2">
                        <label className="text-slate-50">Selecciona el color</label>
                        <select
                            name='color'
                            value={vehicleData.color}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            className="w-full px-3 mt-3 py-2 border rounded text-[#222222]"
                        >
                            <option value="" disabled>Selecciona el color...</option>
                            <option value="Azul">Azul</option>
                            <option value="Verde">Verde</option>
                            <option value="Negro">Negro</option>
                            <option value="Blanco">Blanco</option>
                            <option value="Rojo">Rojo</option>
                        </select>
                        {errors.color && <span className="text-red-500">{errors.color}</span>}
                    </div>

                    <div className="mb-4">
                        <label className="text-slate-50">Modelo</label>
                        <input
                            name='model'
                            type="text"
                            value={vehicleData.model}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            className="w-full px-3 mt-3 py-2 border rounded text-[#222222]"
                        />
                        {errors.model && <span className="text-red-500">{errors.model}</span>}
                    </div>
                </div>
                <div className="flex gap-8">
                    <div className="mb-4 w-1/2">
                        <label className="text-slate-50">Año</label>
                        <input
                            name='year'
                            type="number"
                            value={vehicleData.year}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            className="w-full px-3 mt-3 py-2 border rounded text-[#222222]"
                        />
                        {errors.year && <span className="text-red-500">{errors.year}</span>}
                    </div>
                    <div className="mb-4 w-1/2">
                        <label className="text-slate-50">Selecciona el kilometraje</label>
                        <select
                            name='mileage'
                            value={vehicleData.mileage}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            className="w-full px-3 mt-3 py-2 border rounded text-[#222222]"
                        >
                            <option value="" disabled>Selecciona el kilometraje...</option>
                            <option value="Menos de 50.000km">Menos de 50.000km</option>
                            <option value="50.000km - 100-000km">50.000km - 100-000km</option>
                            <option value="100.000km - 150.000km">100.000km - 150.000km</option>
                            <option value="Más de 150.000km">Más de 150.000km</option>
                        </select>
                        {errors.mileage && <span className="text-red-500">{errors.mileage}</span>}
                    </div>
                </div>
                <div className="mb-4">
                    <label className="text-slate-50">Fotos</label>
                    <input
                        name='file'
                        type="file"
                        accept="image/*"
                        multiple
                        className="w-full px-3 mt-3 py-4 border rounded text-slate-50"
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                    {errors.image && <span className="text-red-500">{errors.image}</span>}
                </div>
                <div className="flex justify-center">
                    <button type="submit" className="mb-6 w-32 items-center bg-[#C4FF0D] text-[#222222] py-2 rounded">
                        Actualizar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UploadPost;
