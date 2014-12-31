package com.tcc.imap.imageupload;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import javax.servlet.GenericServlet;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.io.FilenameUtils;

import com.google.appengine.api.blobstore.BlobKey;
import com.google.appengine.api.blobstore.BlobstoreService;
import com.google.appengine.api.blobstore.BlobstoreServiceFactory;

@SuppressWarnings("serial")
public class ImageUploadServlet extends HttpServlet {
	private static final Logger m_Log = Logger
			.getLogger(ImageUploadServlet.class.getName());
	private static final Map m_FileMap = new HashMap();

	@Override
	public void init() throws ServletException {
	}

	@Override
	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		String ret = null;
		// log.warning("Your warning log message");
		// log.severe("Your severe log message");
		response.setContentType("application/json");

		if (!ServletFileUpload.isMultipartContent(request)) {
			m_Log.warning("Content type is not multipart/form-data");
			ret = "{ 'error' : 'Content type is not multipart/form-data' }";
		} else {
			PrintWriter out = response.getWriter();
			try {
				ServletFileUpload upload = new ServletFileUpload();
				response.setContentType("text/plain");

				FileItemIterator iterator = upload.getItemIterator(request);
				while (iterator.hasNext()) {
					FileItemStream fileItem = iterator.next();

					if (fileItem.isFormField()) {
						m_Log.warning("Got a form field: "
								+ fileItem.getFieldName());
					} else {
						m_Log.warning("Got an uploaded file: "
								+ fileItem.getFieldName() + ", name = "
								+ fileItem.getName());

						m_Log.info("FieldName=" + fileItem.getFieldName());
						m_Log.info("FileName=" + fileItem.getName());
						m_Log.info("ContentType=" + fileItem.getContentType());
						ByteArrayOutputStream bOutput = new ByteArrayOutputStream(1024*1024);
						InputStream stream = fileItem.openStream();
						int len;
						byte[] buffer = new byte[8192];
						while ((len = stream.read(buffer, 0, buffer.length)) != -1) {
							bOutput.write(buffer, 0, len);
						}
						ret = "{\"fileName\" : \"" + fileItem.getName()
								+ "\"}";
						m_FileMap.put(fileItem.getName(), bOutput);
						bOutput.close();
						out.write(ret);
						out.flush();
						stream.close();
					}
				}

			} catch (FileUploadException e) {
				m_Log.severe("Exception in uploading file: " + e.getMessage());
				ret = "{ 'error' : '" + "Exception: " + e.getMessage() + "' }";
			} catch (Exception e) {
				m_Log.severe("Exception in uploading file: " + e.getMessage());
				ret = "{ 'error' : '" + "Exception: " + e.getMessage() + "' }";
			}
		}
	}

	@Override
	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws IOException, ServletException {
		
		try {
			String fileName = request.getParameter("fileName");
			if (fileName == null || fileName.equals("")) {
				throw new ServletException("File Name can't be null or empty");
			}
			ByteArrayOutputStream fileItem = (ByteArrayOutputStream) m_FileMap.get(fileName);
			if (fileItem == null)
				throw new ServletException("File not found: " + fileName);
	
			ServletContext ctx = getServletContext();
			String mimeType = ctx.getMimeType(fileName);
			response.setContentType(mimeType != null ? mimeType
					: "application/octet-stream");
			response.setHeader("Content-Disposition", "attachment; filename=\""
					+ fileName + "\"");
	
			ServletOutputStream os = response.getOutputStream();
			os.write(fileItem.toByteArray(), 0, fileItem.size());
			
			os.flush();
			os.close();
			m_Log.info("File [" + fileName + "] downloaded to client successfully");
			m_FileMap.remove(fileName);
		} catch (Exception e) {
			m_Log.severe("Exception in downloading file: " + e.getMessage());
			throw e;
		}
	}
}
