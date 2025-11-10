import { Link } from "react-router-dom";
export const Hero = () => {
  return (
    <section className="relative overflow-hidden py-28 mx-44 rounded-xl md:px-8">
      <div className="mx-auto text-center relative  w-3/4 p-4 rounded">
        <div className="py-4 flex flex-col items-center justify-center">
            <img src="./banner.png" alt="banner" className="" />
          <h3 className="text-3xl text-gray-800 font-semibold md:text-4xl">
            GotyBot - Tu asistente inteligente para documentos
          </h3>
          <p className="text-gray-600 leading-relaxed mt-3">
            Seré tu asistente inteligente para responder preguntas sobre cualquier documento que me proporciones. ¡Sube un archivo y comencemos!
          </p>
        </div>
        <div className="mt-5 items-center justify-center gap-3 sm:flex">
          <Link
            to="/chat"
            className="block w-full py-2.5 px-8 text-white bg-blue-700 rounded-md duration-150 hover:bg-blue-700 sm:w-auto"
          >
            Empieza ahora
          </Link>
        </div>
      </div>
    </section>
  );
};
