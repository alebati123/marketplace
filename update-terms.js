const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'terminos.html');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /<div class="terms\-content">[\s\S]*?<\/div>/;

const newTerms = `
            <div class="terms-content">
                <p>Bienvenido a LAMBERTUCCI Compra & Venta ("la Plataforma" o "el Sitio"). Al acceder, navegar, registrarte o utilizar nuestros servicios para publicar o adquirir artículos y servicios, aceptas expresamente y sin reservas los siguientes Términos y Condiciones ("el Acuerdo"). Si no estás de acuerdo con estos términos, te solicitamos que no utilices la Plataforma.</p>

                <h2>1. Naturaleza del Servicio y Rol de la Plataforma</h2>
                <p>LAMBERTUCCI funciona exclusiva y estrictamente como un tablón de anuncios virtual o portal de clasificados en línea. Nuestra Plataforma se limita a proveer el espacio digital y la infraestructura técnica para que usuarios independientes (vendedores, compradores y prestadores de servicios) puedan encontrarse, exhibir sus ofertas y contactarse mutuamente.</p>
                <p>LAMBERTUCCI <strong>no interviene</strong> en el perfeccionamiento de las operaciones realizadas entre los usuarios, ni en las condiciones por ellos estipuladas, ni en el pago o la entrega de los bienes o la ejecución de los servicios prestados.</p>

                <h2>2. Exención Absoluta de Responsabilidad (Bienes Físicos)</h2>
                <p>Dado que LAMBERTUCCI no es propietario de los artículos publicados, no tiene posesión de ellos, no los ofrece en venta y no interviene en su entrega, se establece expresamente que:</p>
                <ul>
                    <li>No garantizamos ni nos hacemos responsables por la existencia, calidad, cantidad, estado, integridad, seguridad o legitimidad de los bienes ofrecidos, adquiridos o enajenados por los Usuarios.</li>
                    <li>No nos hacemos responsables por la capacidad legal de los Usuarios para contratar, ni por la exactitud o veracidad de los datos personales ingresados.</li>
                    <li>Cada Usuario comprende y acepta que es el único responsable por los bienes que ofrece y por las compras que efectúa. El uso de la Plataforma es bajo su propio riesgo.</li>
                </ul>

                <h2>3. Responsabilidad sobre la Contratación de Servicios Profesionales</h2>
                <p>La Plataforma permite a los Usuarios ofrecer y buscar Servicios Profesionales (oficios, mantenimiento, fletes, etc.). Al respecto, los Usuarios acuerdan que:</p>
                <ul>
                    <li>LAMBERTUCCI no es empleador, contratista, ni socio de los prestadores de servicios. Los profesionales actúan de manera totalmente independiente.</li>
                    <li>No validamos matrículas, licencias, seguros ni antecedentes penales de los profesionales que anuncian en el Sitio.</li>
                    <li>Cualquier daño a la propiedad, accidente, mala praxis o incumplimiento contractual derivado de un servicio contratado a través de nuestra plataforma, es responsabilidad exclusiva del prestador del servicio y del cliente que lo contrató. LAMBERTUCCI queda eximido de cualquier reclamo civil, penal, laboral o administrativo.</li>
                </ul>

                <h2>4. Sistema de Reputación y Reseñas</h2>
                <p>La Plataforma cuenta con un sistema de Calificaciones facilitado por los mismos Usuarios. Estas reseñas son opiniones subjetivas de terceros y no representan la opinión de LAMBERTUCCI.</p>
                <p>LAMBERTUCCI no asume obligación de verificar la veracidad de los comentarios, pero se reserva el derecho de eliminar reseñas que incluyan insultos, difamaciones, datos personales sensibles o que violen nuestras políticas, a nuestra entera discreción.</p>

                <h2>5. Transacciones y Pagos</h2>
                <p>Toda comunicación, intercambio de información o transacción económica se realiza <strong>estrictamente por fuera de la Plataforma</strong> (ej. transferencia bancaria directa, efectivo en persona, o vías de comunicación como WhatsApp). LAMBERTUCCI no procesa pagos, no retiene fondos ni ofrece sistemas de protección al comprador o depósito en garantía (escrow).</p>
                <p>Recomendamos a los Usuarios tomar precauciones de seguridad estándar, evitar envíos de dinero anticipados a usuarios sin reputación comprobada, y realizar transacciones presenciales en lugares públicos y seguros.</p>

                <h2>6. Propiedad Intelectual y Contenido del Usuario</h2>
                <p>Al subir fotografías, descripciones o logotipos a LAMBERTUCCI, el Usuario nos otorga una licencia gratuita, no exclusiva y global para reproducir, exhibir y adaptar dicho contenido con fines operativos y de marketing del Sitio.</p>
                <p>Está prohibido publicar imágenes con derechos de autor de terceros sin autorización, así como bienes falsificados o réplicas que infrinjan leyes de propiedad intelectual.</p>

                <h2>7. Artículos y Servicios Prohibidos</h2>
                <p>Está estrictamente prohibido utilizar la Plataforma para ofrecer:</p>
                <ul>
                    <li>Armas de fuego, explosivos, municiones o material relacionado.</li>
                    <li>Estupefacientes, drogas ilícitas, medicamentos recetados o sustancias controladas.</li>
                    <li>Bienes robados, contrabandeados o de procedencia dudosa.</li>
                    <li>Servicios de índole sexual, apuestas no reguladas, o esquemas piramidales financieros.</li>
                    <li>Cualquier otro bien o servicio cuya venta o prestación esté prohibida por las leyes nacionales o internacionales aplicables.</li>
                </ul>

                <h2>8. Privacidad y Datos Personales</h2>
                <p>Para operar en el Sitio, los Usuarios deben proveer información personal (nombre, teléfono, correo electrónico). LAMBERTUCCI tomará las medidas técnicas razonables para proteger estos datos. Sin embargo, al publicar un anuncio, el Usuario consiente que cierta información (como su nombre y enlace a WhatsApp) sea pública para permitir el contacto con los interesados. El Usuario es responsable del uso que terceros den a esa información pública.</p>

                <h2>9. Indemnidad</h2>
                <p>El Usuario acepta indemnizar y mantener indemne a LAMBERTUCCI, sus directivos, administradores, representantes y empleados, por cualquier reclamo, demanda, pérdida, gasto, daño y perjuicio (incluyendo honorarios legales) derivado del incumplimiento de estos Términos y Condiciones o de la violación de cualquier ley o derechos de un tercero.</p>

                <h2>10. Moderación, Sanciones y Suspensión de Cuentas</h2>
                <p>LAMBERTUCCI se reserva el derecho exclusivo e inapelable de suspender, eliminar, restringir o modificar cualquier publicación, cuenta, reseña o imagen que considere inapropiada, fraudulenta, riesgosa o que infrinja estos Términos o la legislación vigente, sin necesidad de aviso previo ni derecho a compensación o indemnización para el Usuario afectado.</p>
                
                <h2>11. Modificaciones del Acuerdo</h2>
                <p>LAMBERTUCCI podrá modificar estos Términos y Condiciones en cualquier momento haciendo públicos en el Sitio los términos modificados. El uso continuo de la Plataforma tras la publicación de los cambios constituirá la aceptación expresa de los mismos.</p>

                <h2>12. Jurisdicción y Ley Aplicable</h2>
                <p>Este acuerdo estará regido en todos sus puntos por las leyes vigentes del país de operación primaria de la plataforma. Cualquier controversia derivada del presente acuerdo, su existencia, validez, interpretación, alcance o cumplimiento, será sometida a los tribunales ordinarios competentes locales.</p>
            </div>`;

content = content.replace(regex, newTerms.trim());
fs.writeFileSync(filePath, content, 'utf8');
console.log('T&C Replaced!');
