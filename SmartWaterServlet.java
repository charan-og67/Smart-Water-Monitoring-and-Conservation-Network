import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/smart-water")
public class SmartWaterServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        resp.getWriter().println("{\"service\":\"Smart Water controller\",\"resources\":[\"stations\",\"measurements\",\"alerts\"]}");
    }
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException { resp.setStatus(HttpServletResponse.SC_CREATED); resp.getWriter().println("Created"); }
}
