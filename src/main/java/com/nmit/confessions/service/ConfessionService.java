package com.nmit.confessions.service;

import com.nmit.confessions.dto.CreateConfessionRequest;
import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.exception.DuplicateConfessionException;
import com.nmit.confessions.repository.ConfessionRepository;
import org.springframework.stereotype.Service;

@Service
public class ConfessionService {

    private final ConfessionRepository confessionRepository;
    private final DuplicateDetectionService duplicateDetectionService;
    private final ContentScreeningService contentScreeningService;

    public ConfessionService(ConfessionRepository confessionRepository, 
                             DuplicateDetectionService duplicateDetectionService,
                             ContentScreeningService contentScreeningService) {
        this.confessionRepository = confessionRepository;
        this.duplicateDetectionService = duplicateDetectionService;
        this.contentScreeningService = contentScreeningService;
    }

    public void submitConfession(CreateConfessionRequest request) {
        String content = request.getContent().trim();
        String title = request.getTitle() != null ? request.getTitle().trim() : null;
        
        if (duplicateDetectionService.isDuplicate(content)) {
            throw new DuplicateConfessionException("A very similar confession was recently submitted.");
        }
        
        java.util.Set<com.nmit.confessions.enums.ScreeningFlag> flags = contentScreeningService.screenContent(content);
        
        Confession confession = new Confession();
        confession.setTitle(title);
        confession.setContent(content);
        confession.setCategory(request.getCategory());
        confession.setStatus(ConfessionStatus.PENDING);
        confession.setScreeningFlags(flags);
        
        confessionRepository.save(confession);
    }
}
