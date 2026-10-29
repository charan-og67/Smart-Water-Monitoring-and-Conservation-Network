import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class TransactionHistory {
    static class Entry { String type, details; LocalDateTime time = LocalDateTime.now(); Entry(String type,String details){this.type=type;this.details=details;} }
    private final List<Entry> history = new ArrayList<>();
    public void archive(String type, String details){ history.add(new Entry(type, details)); }
    public void printHistory(){ for(Entry e: history) System.out.println(e.time+" | "+e.type+" | "+e.details); }
}
