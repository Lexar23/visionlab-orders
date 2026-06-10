
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, password, role } = await req.json();

        if (!email || !password || !role) {
            return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
        }

        // Verificar si el usuario ya existe
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario con el nuevo rol
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: role,
            }
        });

        return NextResponse.json({ message: "Usuario creado correctamente" }, { status: 201 });
    } catch (error) {
        console.error("Error en registro:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
