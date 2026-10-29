import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import java.io.IOException;

public class SessionDemoServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req,HttpServletResponse resp) throws IOException {
        HttpSession session=req.getSession(); session.setAttribute("dashboardPreference","water-quality");
        Cookie cookie=new Cookie("stakeholder","active"); cookie.setMaxAge(3600); resp.addCookie(cookie);
        resp.getWriter().println("Session active; dashboard preference saved.");
    }
}
