import { prisma } from "@/utils/connect";
import { NextRequest, NextResponse } from "next/server";

//* Get all visible products
export const GET = async (req: NextRequest) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                isVisible: true,
            },
            orderBy: [
            {
                catSlug: "asc",
            },
            {
                title: "asc",
            },
        ]
        });
        const response = new NextResponse(JSON.stringify(products), { status: 200 });
        response.headers.set("Cache-Control", "no-store");
        return response;
    } catch (err) {
        console.log(err);
        return new NextResponse(
            JSON.stringify({ message: "Algo salio mal con el fetch de los productos!" }),
            { status: 500 }
        );
    }
};
