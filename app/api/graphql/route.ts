import { serverClient } from "@/lib/server/serverClient";
import { gql } from "@apollo/client";
import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function POST(request: NextRequest) {
    const { query, variables } = await request.json();

    try {
        let result;

        if (query.trim().startsWith('mutation')) {
            // Handle Mutations
            result = await serverClient.mutate({
                mutation: gql`
                ${query}`,
                variables,
            });

            console.log('Mutation Result:', result);
            
            return NextResponse.json({
                data: result.data
            }, {
                headers: corsHeaders
            });
        } else {
            // Handle queries
            result = await serverClient.query({
                query: gql`${query}`,
                variables,
            });

            console.log("Query Response: ", {
                data: result?.data,
                errors: result?.errors
            })

            return NextResponse.json({
                data: result.data,
            }, {
                headers: corsHeaders,
            })
        }
    } catch (error) {
        console.log(error);
        return NextResponse.json(error, {
            status: 500,
        });
    }
}