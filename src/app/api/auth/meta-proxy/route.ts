import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    // 1. Construct the inner URL (the actual OAuth core)
    const innerUrl = new URL("https://business.facebook.com/dialog/oauth");
    searchParams.forEach((value, key) => {
        innerUrl.searchParams.append(key, value);
    });
    
    // Add Meta Business overrides to the inner URL
    if (process.env.FACEBOOK_CONFIG_ID) {
        innerUrl.searchParams.set("config_id", process.env.FACEBOOK_CONFIG_ID);
    }
    innerUrl.searchParams.set("override_default_response_type", "1");
    innerUrl.searchParams.set("display", "popup");
    innerUrl.searchParams.set("ret", "login");
    innerUrl.searchParams.set("fbapp_pres", "0");

    // 2. Construct the outer wrapper URL (forces Instagram overlay)
    const outerUrl = new URL("https://business.facebook.com/business/loginpage/new/");
    
    // Pass the entire OAuth flow into the "next" parameter
    outerUrl.searchParams.set("next", innerUrl.toString());
    
    // Inject ManyChat's secret sauce
    outerUrl.searchParams.set("login_options[0]", "IG");
    outerUrl.searchParams.set("app", searchParams.get("client_id") || "");
    outerUrl.searchParams.set("cma_account_switch", "1");
    outerUrl.searchParams.set("is_ig_oidc_with_redirect", "1");
    outerUrl.searchParams.set("display", "popup");
    outerUrl.searchParams.set("full_page_redirect_experimental", "1");
    outerUrl.searchParams.set("show_back_button", "0");

    return NextResponse.redirect(outerUrl.toString());
}
