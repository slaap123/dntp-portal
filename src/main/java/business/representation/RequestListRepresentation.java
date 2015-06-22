package business.representation;

import java.util.Date;

public class RequestListRepresentation {

    private String processInstanceId;
    private String requesterId;
    private String requesterName;
    private String status;
    private Date dateCreated;

    private String assignee;
    private String assigneeName;
    private Date dateAssigned;

    private String title;
    private String background;
    private String researchQuestion;
    private String hypothesis;
    private String methods;

    private boolean statisticsRequest;
    private boolean excerptsRequest;
    private boolean paReportRequest;
    private boolean materialsRequest;
    
    private String approvalVote;
    private Long numberOfApprovalVotes;
    
    public RequestListRepresentation() {

    }

    public String getProcessInstanceId() {
        return processInstanceId;
    }

    public void setProcessInstanceId(String processInstanceId) {
        this.processInstanceId = processInstanceId;
    }

    public String getRequesterId() {
        return requesterId;
    }

    public void setRequesterId(String requesterId) {
        this.requesterId = requesterId;
    }

    public String getRequesterName() {
        return requesterName;
    }

    public void setRequesterName(String requesterName) {
        this.requesterName = requesterName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Date getDateCreated() {
        return dateCreated;
    }

    public void setDateCreated(Date dateCreated) {
        this.dateCreated = dateCreated;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getBackground() {
        return background;
    }

    public void setBackground(String background) {
        this.background = background;
    }

    public String getResearchQuestion() {
        return researchQuestion;
    }

    public void setResearchQuestion(String researchQuestion) {
        this.researchQuestion = researchQuestion;
    }

    public String getHypothesis() {
        return hypothesis;
    }

    public void setHypothesis(String hypothesis) {
        this.hypothesis = hypothesis;
    }

    public String getMethods() {
        return methods;
    }

    public void setMethods(String methods) {
        this.methods = methods;
    }

    public String getAssignee() {
        return assignee;
    }

    public void setAssignee(String assignee) {
        this.assignee = assignee;
    }

    public String getAssigneeName() {
        return assigneeName;
    }

    public Date getDateAssigned() {
        return dateAssigned;
    }

    public void setDateAssigned(Date dateAssigned) {
        this.dateAssigned = dateAssigned;
    }

    public void setAssigneeName(String assigneeName) {
        this.assigneeName = assigneeName;
    }

    public String getApprovalVote() {
        return approvalVote;
    }

    public void setApprovalVote(String approvalVote) {
        this.approvalVote = approvalVote;
    }

    public Long getNumberOfApprovalVotes() {
        return numberOfApprovalVotes;
    }

    public void setNumberOfApprovalVotes(Long numberOfApprovalVotes) {
        this.numberOfApprovalVotes = numberOfApprovalVotes;
    }

    public boolean isStatisticsRequest() {
        return statisticsRequest;
    }

    public void setStatisticsRequest(boolean statisticsRequest) {
        this.statisticsRequest = statisticsRequest;
    }

    public boolean isExcerptsRequest() {
        return excerptsRequest;
    }

    public void setExcerptsRequest(boolean excerptsRequest) {
        this.excerptsRequest = excerptsRequest;
    }

    public boolean isPaReportRequest() {
        return paReportRequest;
    }

    public void setPaReportRequest(boolean paReportRequest) {
        this.paReportRequest = paReportRequest;
    }

    public boolean isMaterialsRequest() {
        return materialsRequest;
    }

    public void setMaterialsRequest(boolean materialsRequest) {
        this.materialsRequest = materialsRequest;
    }
    
}