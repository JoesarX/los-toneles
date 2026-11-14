import { toProduct } from "@/lib/products";
import { getAuthSession } from "@/utils/auth";
import { prisma } from "@/utils/connect";
import { NextRequest, NextResponse } from "next/server";

// FETCH ALL PRODUCTS
export const GET = async () => {
    const session = await getAuthSession();

    if (session?.user.isAdmin) {
        try {
            // prototype:
            // const #nombreVariable = await prisma.#nombreTabla.findMany({
            const products = await prisma.product.findMany({
                orderBy: [
                    {
                        isVisible: "desc",
                    },
                    {
                        catSlug: "asc",
                    },
                    {
                        title: "asc",
                    },
                ]
            });
            const response = new NextResponse(
                JSON.stringify(products.map(toProduct)),
                { status: 200 }
            );
            response.headers.set("Cache-Control", "no-store");
            return response
        } catch (err) {
            console.log(err);
            return new NextResponse(
                JSON.stringify({ message: "Algo salio mal con el fetch de los productos!" }),
                { status: 500 }
            );
        }
    }

    return new NextResponse(
        JSON.stringify({ message: 'You are not allowed!' }),
        { status: 403 }
    );
};
export const POST = async (req: NextRequest) => {
    const session = await getAuthSession();
    if (session?.user.isAdmin) {
        try {
            const body = await req.json();
            const product = await prisma.product.create({
                data: body,
            });

            
            return new NextResponse(JSON.stringify(toProduct(product)), {
                status: 201,
            });
        } catch (err) {
            console.log(err);
            return new NextResponse(
                JSON.stringify({ message: "Something went wrong!" }),
                { status: 500 }
            );
        }
    }

    return new NextResponse(
        JSON.stringify({ message: 'You are not allowed!' }),
        { status: 403 }
    );
};